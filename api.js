import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  deleteUser,
  multiFactor,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  child,
  get,
  set,
  update,
  push,
  remove,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp,
  onDisconnect,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import {
  getFirestore,
  initializeFirestore,
  doc as fdoc,
  setDoc,
  getDoc,
  deleteDoc,
  Bytes,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
  isSupported as isMessagingSupported,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js";

export const serviceConfig = {
  apiKey: "AIzaSyCjadRD1TAix0IsjaxYI-76P9mDpKmQ34Q",
  authDomain: "quickchat-f5012.firebaseapp.com",
  databaseURL: "https://quickchat-f5012-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quickchat-f5012",
  storageBucket: "quickchat-f5012.firebasestorage.app",
  messagingSenderId: "80730246249",
  appId: "1:80730246249:web:b3b444c63aca7a5c7466f8",
  measurementId: "G-B7MFW899QJ",
};

let app, auth, db, firestore, messaging;
export function getFb() {
  return { app, auth, db, firestore };
}

export async function boot() {
  if (app) return getFb();
  app = initializeApp(serviceConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  // Use HTTP long-polling instead of Firestore WebChannel streaming.
  // This avoids the browser preflight/streaming CORS issue seen on localhost.
  try {
    firestore = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } catch {
    firestore = getFirestore(app);
  }
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    /* ignore */
  }
  try {
    if (await isMessagingSupported()) messaging = getMessaging(app);
  } catch {
    messaging = null;
  }
  return getFb();
}

export function onUser(cb) {
  return onAuthStateChanged(auth, cb);
}

export function currentUser() {
  return auth?.currentUser || null;
}


function cleanUsername(raw) {
  return String(raw || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export { cleanUsername };

export async function register({ email, password, name, username }) {
  const uname = cleanUsername(username);
  if (uname.length < 3) throw new Error("username-short");
  const taken = await get(ref(db, `usernames/${uname}`));
  if (taken.exists()) throw new Error("username-taken");
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const uid = cred.user.uid;
  await updateProfile(cred.user, { displayName: name.trim() });
  const profile = {
    uid,
    name: name.trim(),
    username: uname,
    email: email.trim(),
    verified: isVerifiedEmail(email),
    bio: "",
    color: colorFrom(uname),
    musicTitle: "",
    musicArtist: "",
    createdAt: Date.now(),
    settings: defaultSettings(),
  };
  await set(ref(db, `users/${uid}`), profile);
  await set(ref(db, `usernames/${uname}`), uid);
  await ensureSaved(uid, profile);
  let verificationSent = false;
  try {
    await sendEmailVerification(cred.user);
    verificationSent = true;
  } catch (error) {
    console.warn("Email verification could not be sent", error);
  }
  await signOut(auth);
  return { user: cred.user, verificationSent };
}

export async function login({ email, password }) {
  try {
    const cred = await signInWithEmailAndPassword(auth, String(email || "").trim(), password);
    if (!cred?.user) throw new Error("auth/no-current-user");
    if (!cred.user.emailVerified && !isVerifiedEmail(cred.user.email)) {
      await signOut(auth);
      const error = new Error("email-not-verified");
      error.code = "auth/email-not-verified";
      error.email = String(email || "").trim();
      throw error;
    }
    return cred.user;
  } catch (error) {
    if (error?.code === "auth/multi-factor-auth-required") {
      const resolver = getMultiFactorResolver(auth, error);
      return { mfaRequired: true, resolver };
    }
    throw error;
  }
}

export async function completeTotpSignIn(resolver, code) {
  if (!resolver) throw new Error("auth/mfa-resolver-missing");
  const clean = String(code || "").replace(/\D/g, "").slice(0, 6);
  if (clean.length !== 6) throw new Error("auth/invalid-verification-code");
  const hint = resolver.hints?.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID) || resolver.hints?.[0];
  if (!hint) throw new Error("auth/mfa-factor-missing");
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, clean);
  const cred = await resolver.resolveSignIn(assertion);
  if (!cred?.user) throw new Error("auth/no-current-user");
  if (!cred.user.emailVerified && !isVerifiedEmail(cred.user.email)) {
    await signOut(auth);
    const error = new Error("email-not-verified");
    error.code = "auth/email-not-verified";
    error.email = cred.user.email || "";
    throw error;
  }
  return cred.user;
}

export function getTotpFactors() {
  const user = auth?.currentUser;
  return user ? multiFactor(user).enrolledFactors.filter((f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID) : [];
}

export function isTotpEnabled() {
  return getTotpFactors().length > 0;
}

export async function startTotpEnrollment(password = "") {
  const user = auth?.currentUser;
  if (!user) throw Object.assign(new Error("auth/no-current-user"), { code: "auth/no-current-user" });
  if (password && user.email) {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  }
  const session = await multiFactor(user).getSession();
  const secret = await TotpMultiFactorGenerator.generateSecret(session);
  const accountName = user.email || user.uid;
  const issuer = "NexLink";
  const uri = secret.generateQrCodeUrl(accountName, issuer);
  return { secret, uri, accountName, issuer };
}

export async function finishTotpEnrollment(secret, code, displayName = "NexLink") {
  const user = auth?.currentUser;
  if (!user || !secret) throw new Error("auth/no-current-user");
  const clean = String(code || "").replace(/\D/g, "").slice(0, 6);
  if (clean.length !== 6) throw new Error("auth/invalid-verification-code");
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, clean);
  await multiFactor(user).enroll(assertion, displayName);
  return true;
}

export async function disableTotp() {
  const user = auth?.currentUser;
  if (!user) throw new Error("auth/no-current-user");
  const factor = getTotpFactors()[0];
  if (!factor) return false;
  await multiFactor(user).unenroll(factor.uid);
  return true;
}

export async function resendVerificationEmail(email, password) {
  const cleanEmail = String(email || "").trim();
  if (!cleanEmail || !String(password || "")) throw new Error("auth/invalid-credential");
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  if (!cred?.user) throw new Error("auth/no-current-user");
  if (cred.user.emailVerified || isVerifiedEmail(cred.user.email)) {
    await signOut(auth);
    return { alreadyVerified: true };
  }
  try {
    await sendEmailVerification(cred.user);
    return { alreadyVerified: false, sent: true };
  } catch (error) {
    if (error?.code === "auth/too-many-requests") {
      throw Object.assign(new Error("verification-rate-limited"), { code: "auth/too-many-requests" });
    }
    throw error;
  } finally {
    try { await signOut(auth); } catch {}
  }
}

export async function logout() {
  const user = auth?.currentUser;
  if (user) {
    try {
      await set(ref(db, `presence/${user.uid}`), { online: false, at: Date.now() });
    } catch {
      /* ignore */
    }
  }
  await signOut(auth);
  return true;
}

export async function deleteAccount(password = "") {
  const user = auth?.currentUser;
  if (!user) throw new Error("auth/no-current-user");
  if (!user.email) throw new Error("auth/email-required");

  // Firebase requires a recent authentication for permanent account deletion.
  if (password) {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  const uid = user.uid;
  let profile = null;
  try { profile = (await get(ref(db, `users/${uid}`))).val() || null; } catch {}
  const uname = cleanUsername(profile?.username || "");

  // Remove private user-scoped data first. Shared chats/messages are intentionally
  // preserved so the rest of a conversation is not destroyed for other members.
  await Promise.allSettled([
    remove(ref(db, `users/${uid}`)),
    remove(ref(db, `inbox/${uid}`)),
    remove(ref(db, `presence/${uid}`)),
    remove(ref(db, `trustedDevices/${uid}`)),
    remove(ref(db, `securityRequests/${uid}`)),
    remove(ref(db, `contacts/${uid}`)),
    remove(ref(db, `saved/${uid}`)),
    uname ? remove(ref(db, `usernames/${uname}`)) : Promise.resolve(),
  ]);

  await deleteUser(user);
  return true;
}

const PUSH_VAPID_KEY = "BNRHO80uGZgCBv7RAjUtm2ulPCeFooITr38_fz4D2n4u0zZa0DUr8FgrDxXeZgXERjWBYk1qazCZAuaRcJEq2gQ";

async function ensureMessaging() {
  if (messaging) return messaging;
  if (!app || !(await isMessagingSupported())) return null;
  try { messaging = getMessaging(app); } catch { messaging = null; }
  return messaging;
}

export async function enablePushNotifications(uid) {
  const userId = String(uid || auth?.currentUser?.uid || "");
  if (!userId) throw new Error("auth/no-current-user");
  if (!window.isSecureContext) throw new Error("push-insecure-context");
  if (!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("push-unsupported");
  const msg = await ensureMessaging();
  if (!msg) throw new Error("push-unsupported");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("push-permission-denied");
  const registration = await navigator.serviceWorker.register("./firebase-messaging-sw.js", { scope: "./" });
  await navigator.serviceWorker.ready;
  const token = await getToken(msg, { vapidKey: PUSH_VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) throw new Error("push-token-empty");
  const tokenId = btoa(unescape(encodeURIComponent(token))).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 180) || token.slice(0, 120);
  await set(ref(db, `pushTokens/${userId}/${tokenId}`), { token, platform: "web", updatedAt: Date.now() });
  localStorage.setItem("nexlink_push_enabled", "1");
  return token;
}

export async function disablePushNotifications(uid) {
  const userId = String(uid || auth?.currentUser?.uid || "");
  if (!userId) return false;
  try {
    const msg = await ensureMessaging();
    if (msg) await deleteToken(msg);
  } catch { /* ignore */ }
  try { await remove(ref(db, `pushTokens/${userId}`)); } catch { /* ignore */ }
  localStorage.removeItem("nexlink_push_enabled");
  return true;
}

export async function initPushNotifications(uid, onForeground = null) {
  const msg = await ensureMessaging();
  if (!msg || !uid || typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  try { await enablePushNotifications(uid); } catch { return false; }
  try {
    onMessage(msg, (payload) => {
      if (typeof onForeground === "function") onForeground(payload);
      const title = payload?.notification?.title || "NexLink";
      const body = payload?.notification?.body || "Новое уведомление";
      if (Notification.permission === "granted" && document.visibilityState === "hidden") {
        try { new Notification(title, { body, icon: "./favicon.svg", tag: payload?.data?.chatId || "nexlink" }); } catch {}
      }
    });
  } catch { /* ignore */ }
  return true;
}

export function pushSupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && window.isSecureContext;
}

export function defaultSettings() {
  return {
    theme: "midnight",
    notifications: true,
    messagePreview: true,
    sounds: true,
    reduceMotion: false,
    locale: "ru",
    whoCanMessage: "everyone",
    whoCanCall: "contacts",
    whoCanAdd: "contacts",
    whoCanSeeProfile: "everyone",
    whoCanSeeLastSeen: "contacts",
  };
}

export function colorFrom(seed) {
  const palette = ["#3D8BFD", "#2A9D8F", "#4A6FA5", "#1D8A99", "#5EA0FF", "#3B6FE0", "#2F6FED", "#149C78"];
  let h = 0;
  const s = String(seed || "n");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

const VERIFIED_EMAILS = new Set([
  "fatimamuslimova468@gmail.com",
  "mertyesport1@gmail.com",
]);

export function isVerifiedEmail(email) {
  return VERIFIED_EMAILS.has(String(email || "").trim().toLowerCase());
}

export async function loadProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  if (!snap.exists()) return null;
  const profile = snap.val() || {};
  return { ...profile, verified: !!profile.verified || isVerifiedEmail(profile.email) };
}

export async function saveProfile(uid, patch) {
  await update(ref(db, `users/${uid}`), patch);
  if (patch.username) {
    await set(ref(db, `usernames/${cleanUsername(patch.username)}`), uid);
  }
}

export async function findByUsername(username) {
  const uname = cleanUsername(username);
  if (!uname) return null;
  const snap = await get(ref(db, `usernames/${uname}`));
  if (!snap.exists()) return null;
  const uid = snap.val();
  const user = await loadProfile(uid);
  return user ? { ...user, uid } : null;
}

export async function searchUsers(queryText) {
  const q = String(queryText || "").trim().toLowerCase().replace(/^@/, "");
  if (!q) return [];
  const snap = await get(ref(db, "users"));
  if (!snap.exists()) return [];
  const data = snap.val() || {};
  return Object.entries(data)
    .map(([uid, u]) => ({ uid, ...(u || {}) }))
    .filter((u) => {
      const name = String(u.name || u.displayName || "").toLowerCase();
      const username = String(u.username || "").toLowerCase();
      return name.includes(q) || username.includes(q);
    })
    .sort((a, b) => {
      const an = String(a.username || a.name || "").toLowerCase();
      const bn = String(b.username || b.name || "").toLowerCase();
      return (an.startsWith(q) ? -1 : 0) - (bn.startsWith(q) ? -1 : 0);
    })
    .slice(0, 20);
}

export async function searchCommunities(queryText) {
  const q = String(queryText || "").trim().toLowerCase();
  if (!q) return [];
  const snap = await get(ref(db, "chats"));
  if (!snap.exists()) return [];
  const data = snap.val() || {};
  return Object.entries(data)
    .map(([id, c]) => ({ id, ...c }))
    .filter((c) => (c.type === "group" || c.type === "channel") && !c.private && String(c.name || "").toLowerCase().includes(q))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 50);
}

export async function getMutualGroups(uidA, uidB) {
  if (!uidA || !uidB || uidA === uidB) return [];
  const snap = await get(ref(db, "chats"));
  if (!snap.exists()) return [];
  const data = snap.val() || {};
  return Object.entries(data)
    .map(([id, c]) => ({ id, ...(c || {}) }))
    .filter((c) => {
      if (c.type !== "group") return false;
      const members = c.members || {};
      return Object.prototype.hasOwnProperty.call(members, uidA) && Object.prototype.hasOwnProperty.call(members, uidB);
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function listenProfile(uid, cb) {
  return onValue(ref(db, `users/${uid}`), (s) => cb(s.val()));
}

export function listenPresence(uid, cb) {
  return onValue(ref(db, `presence/${uid}`), (s) => cb(s.val() || { online: false }));
}

export function getDeviceId() {
  const key = "nexlink_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = (crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9_-]/g, "");
    localStorage.setItem(key, id);
  }
  return id;
}

export async function getLoginNetworkMeta() {
  const ua = navigator.userAgent || "Unknown browser";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  let ip = "не определён";
  try {
    const r = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (r.ok) ip = (await r.json())?.ip || ip;
  } catch { /* IP optional */ }
  const tzMap = {
    "Europe/Vienna": "Vienna, Austria",
    "Europe/Berlin": "Berlin, Germany",
    "Europe/Moscow": "Moscow, Russia",
    "Europe/London": "London, United Kingdom",
    "Europe/Paris": "Paris, France",
    "Europe/Warsaw": "Warsaw, Poland",
    "Europe/Prague": "Prague, Czechia",
    "Europe/Kyiv": "Kyiv, Ukraine",
    "America/New_York": "New York, USA",
    "America/Los_Angeles": "Los Angeles, USA",
    "Asia/Tokyo": "Tokyo, Japan",
  };
  return { ip, userAgent: ua, timezone, location: tzMap[timezone] || timezone || "Не определена" };
}

const QR_LOGIN_EXCHANGE_URL = "https://europe-west1-quickchat-f5012.cloudfunctions.net/qrLoginExchange";
function randomToken(len = 32) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export async function createQrLoginSession() {
  const sessionId = randomToken(16);
  const secret = randomToken(24);
  await set(ref(db, `qrLoginSessions/${sessionId}`), {
    sessionId, secret, status: "pending", createdAt: Date.now(), expiresAt: Date.now() + 120000
  });
  return { sessionId, secret };
}

export async function approveQrLoginSession(sessionId, secret, uid) {
  const snap = await get(ref(db, `qrLoginSessions/${sessionId}`));
  const row = snap.val();
  if (!row || row.secret !== secret || Number(row.expiresAt || 0) < Date.now()) throw new Error("QR-код истёк");
  await update(ref(db, `qrLoginSessions/${sessionId}`), { status: "approved", approvedBy: uid, approvedAt: Date.now() });
  return true;
}

export async function waitForQrLoginApproval(sessionId, secret, timeout = 120000) {
  const start = Date.now();
  return await new Promise((resolve, reject) => {
    let off = null;
    let settled = false;
    const finish = (err, val) => {
      if (settled) return;
      settled = true;
      if (off) off();
      err ? reject(err) : resolve(val);
    };
    off = onValue(ref(db, `qrLoginSessions/${sessionId}`), (snap) => {
      const row = snap.val();
      if (!row) return;
      if (row.secret !== secret) return finish(new Error("QR-сессия недействительна"));
      if (Number(row.expiresAt || 0) < Date.now()) return finish(new Error("QR-код истёк"));
      if (row.status === "approved") return finish(null, row);
      if (Date.now() - start > timeout) finish(new Error("Время ожидания истекло"));
    });
    setTimeout(() => finish(new Error("Время ожидания истекло")), timeout + 250);
  });
}

export async function exchangeQrLogin(sessionId, secret) {
  const r = await fetch(QR_LOGIN_EXCHANGE_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, secret })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.customToken) throw new Error(data.error || "Не удалось выполнить QR-вход");
  const { signInWithCustomToken } = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js");
  return (await signInWithCustomToken(auth, data.customToken)).user;
}

export async function registerLoginDevice(uid, meta = {}) {
  const deviceId = getDeviceId();
  const base = `trustedDevices/${uid}/${deviceId}`;
  const existing = await get(ref(db, base));
  if (!existing.exists()) {
    const trustedCount = await get(ref(db, `trustedDevices/${uid}`));
    const hasAny = trustedCount.exists() && Object.keys(trustedCount.val() || {}).length > 0;
    await set(ref(db, base), {
      deviceId,
      trusted: !hasAny,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      userAgent: meta.userAgent || "",
      ip: meta.ip || "не определён",
      location: meta.location || "Не определена",
      timezone: meta.timezone || "",
    });
  } else {
    await update(ref(db, base), { lastSeenAt: Date.now(), userAgent: meta.userAgent || existing.val()?.userAgent || "", ip: meta.ip || existing.val()?.ip || "не определён", location: meta.location || existing.val()?.location || "Не определена" });
  }
  const snap = await get(ref(db, base));
  return { deviceId, ...(snap.val() || {}) };
}

export async function createLoginSecurityRequest(uid, session = {}) {
  const id = push(ref(db, `securityRequests/${uid}`)).key;
  await set(ref(db, `securityRequests/${uid}/${id}`), {
    id, status: "pending", createdAt: Date.now(), sessionId: session.sessionId || "", deviceId: session.deviceId || getDeviceId(),
    ip: session.ip || "не определён", userAgent: session.userAgent || "", location: session.location || "Не определена",
  });
  return id;
}

export function listenLoginSecurityRequests(uid, cb) {
  return onValue(ref(db, `securityRequests/${uid}`), (s) => cb(s.val() || {}));
}

export async function decideLoginSecurityRequest(uid, requestId, approved) {
  await update(ref(db, `securityRequests/${uid}/${requestId}`), { status: approved ? "approved" : "rejected", decidedAt: Date.now() });
}

export function listenLoginSecurityRequest(uid, requestId, cb) {
  return onValue(ref(db, `securityRequests/${uid}/${requestId}`), (s) => cb(s.val() || null));
}

export async function trustDevice(uid, deviceId) {
  await update(ref(db, `trustedDevices/${uid}/${deviceId}`), { trusted: true, trustedAt: Date.now() });
}


export async function setPresence(uid, online = true) {
  const p = ref(db, `presence/${uid}`);
  if (!online) {
    await set(p, { online: false, at: Date.now() });
    return;
  }
  await set(p, { online: true, at: Date.now() });
  onDisconnect(p).set({ online: false, at: Date.now() });
}

export async function markChatRead(uid, chatId, messageId, at = Date.now()) {
  if (!uid || !chatId) return;
  await set(ref(db, `reads/${chatId}/${uid}`), { messageId: messageId || null, at });
}

export function listenChatReads(chatId, cb) {
  if (!chatId) return () => {};
  return onValue(ref(db, `reads/${chatId}`), (s) => cb(s.val() || {}));
}

export function listenInbox(uid, cb) {
  return onValue(ref(db, `inbox/${uid}`), (s) => cb(s.val() || {}));
}

export function listenChat(chatId, cb) {
  return onValue(ref(db, `chats/${chatId}`), (s) => cb(s.val()));
}

export function listenMessages(chatId, cb) {
  const r = ref(db, `messages/${chatId}`);
  const handler = (s) => {
    const val = s.val() || {};
    const list = Object.entries(val)
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .slice(-400);
    cb(list);
  };
  return onValue(r, handler);
}


export async function saveE2EEPublicKey(uid, publicKey) {
  await set(ref(db, `e2eeKeys/${uid}`), publicKey);
}

export async function loadE2EEPublicKey(uid) {
  const snap = await get(ref(db, `e2eeKeys/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export async function createPoll(chatId, { senderId, question, options, anonymous = true }) {
  const chatSnap = await get(ref(db, `chats/${chatId}`));
  const chat = chatSnap.val();
  if (!chat) throw new Error("chat-not-found");
  if (chat.type !== "group" && chat.type !== "channel") throw new Error("poll-community-only");
  if (chat.createdBy !== senderId) throw new Error("poll-owner-only");
  const cleanQuestion = String(question || "").trim().slice(0, 300);
  const cleanOptions = [...new Set((options || []).map((x) => String(x || "").trim()).filter(Boolean))].slice(0, 4);
  if (cleanQuestion.length < 2) throw new Error("poll-question-required");
  if (cleanOptions.length < 2) throw new Error("poll-two-options");
  const id = push(child(ref(db), `messages/${chatId}`)).key;
  const payload = {
    senderId,
    kind: "poll",
    text: cleanQuestion,
    poll: { question: cleanQuestion, options: cleanOptions, votes: {}, createdBy: senderId, anonymous: !!anonymous },
    createdAt: Date.now(),
  };
  await set(ref(db, `messages/${chatId}/${id}`), payload);
  const preview = `📊 ${cleanQuestion}`.slice(0, 140);
  await update(ref(db, `chats/${chatId}`), { lastText: preview, lastAt: Date.now(), lastSender: senderId, lastKind: "poll" });
  for (const uid of Object.keys(chat.members || {})) {
    const patch = { updatedAt: Date.now(), chatId, type: chat.type };
    if (uid !== senderId) await bumpUnread(uid, chatId);
    await update(ref(db, `inbox/${uid}/${chatId}`), patch);
  }
  return { id, ...payload };
}

export async function votePoll(chatId, messageId, uid, optionIndex) {
  const chatSnap = await get(ref(db, `chats/${chatId}`));
  const chat = chatSnap.val();
  if (!chat || (chat.type !== "group" && chat.type !== "channel")) throw new Error("poll-community-only");
  if (!chat.members?.[uid]) throw new Error("poll-members-only");
  const msgSnap = await get(ref(db, `messages/${chatId}/${messageId}`));
  const msg = msgSnap.val();
  if (!msg || msg.kind !== "poll" || !Array.isArray(msg.poll?.options)) throw new Error("poll-not-found");
  const idx = Number(optionIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= msg.poll.options.length) throw new Error("poll-option-invalid");
  await runTransaction(ref(db, `messages/${chatId}/${messageId}/poll/votes/${uid}`), () => idx);
  return true;
}

export async function sendMessage(chatId, msg) {
  const chatSnap = await get(ref(db, `chats/${chatId}`));
  const chat = chatSnap.val();
  if (!chat) throw new Error("chat-not-found");
  if (chat.type === "bot" && chat.peerId === "security" && msg.senderId !== "security") {
    const err = new Error("security-bot-readonly");
    err.code = "security-bot-readonly";
    throw err;
  }
  if (chat.type === "private" && msg.senderId) {
    const peer = chat.peers?.[msg.senderId];
    if (peer) {
      const blocked = await get(ref(db, `blocks/${peer}/${msg.senderId}`));
      if (blocked.exists() && blocked.val() === true) throw new Error("user-blocked");
    }
  }
  const id = push(child(ref(db), `messages/${chatId}`)).key;
  const payload = {
    ...msg,
    createdAt: Date.now(),
  };
  await set(ref(db, `messages/${chatId}/${id}`), payload);
  const preview =
    msg.kind === "image"
      ? "📷"
      : msg.kind === "call"
          ? "📞"
          : msg.kind === "poll"
            ? `📊 ${String(msg.poll?.question || msg.text || "Опрос")}`.slice(0, 140)
            : String(msg.text || "").slice(0, 140);
  await update(ref(db, `chats/${chatId}`), {
    lastText: preview,
    lastAt: Date.now(),
    lastSender: msg.senderId,
    lastKind: msg.kind || "text",
  });
  if (chat?.members) {
    for (const uid of Object.keys(chat.members)) {
      const patch = { updatedAt: Date.now(), chatId, type: chat.type || "private" };
      if (uid !== msg.senderId) await bumpUnread(uid, chatId);
      await update(ref(db, `inbox/${uid}/${chatId}`), patch);
    }
  }
  return id;
}

async function bumpUnread(uid, chatId) {
  const r = ref(db, `inbox/${uid}/${chatId}/unread`);
  try {
    const res = await runTransaction(r, (cur) => (cur || 0) + 1);
    return res.snapshot.val();
  } catch {
    return 1;
  }
}

export async function clearUnread(uid, chatId) {
  await update(ref(db, `inbox/${uid}/${chatId}`), { unread: 0 });
}


export async function getMessages(chatId) {
  const snap = await get(ref(db, `messages/${chatId}`));
  const val = snap.val() || {};
  return Object.entries(val).map(([id, m]) => ({ id, ...m })).sort((a,b) => (a.createdAt||0) - (b.createdAt||0));
}

export async function clearChat(chatId) {
  await remove(ref(db, `messages/${chatId}`));
  await update(ref(db, `chats/${chatId}`), { lastText: "", lastAt: 0, lastSender: null, lastKind: "text" });
}

export async function setBlocked(uid, otherUid, blocked = true) {
  const r = ref(db, `blocks/${uid}/${otherUid}`);
  if (blocked) await set(r, true); else await remove(r);
}

export async function isBlocked(uid, otherUid) {
  const s = await get(ref(db, `blocks/${uid}/${otherUid}`));
  return s.exists() && s.val() === true;
}


export async function deleteMessage(chatId, id) {
  await remove(ref(db, `messages/${chatId}/${id}`));
}

export async function ensureSaved(uid, profile) {
  const chatId = `saved_${uid}`;
  const chat = {
    id: chatId,
    type: "saved",
    name: "Избранное",
    color: "#3D8BFD",
    members: { [uid]: "owner" },
    createdBy: uid,
    createdAt: Date.now(),
  };
  const existing = await get(ref(db, `chats/${chatId}`));
  if (!existing.exists()) await set(ref(db, `chats/${chatId}`), chat);
  const inbox = await get(ref(db, `inbox/${uid}/${chatId}`));
  if (!inbox.exists()) {
    await set(ref(db, `inbox/${uid}/${chatId}`), {
      chatId,
      type: "saved",
      pinned: true,
      muted: false,
      unread: 0,
      updatedAt: Date.now(),
    });
  }
  return chatId;
}

export function privateId(a, b) {
  return "p_" + [a, b].sort().join("_");
}

export async function ensurePrivate(me, other) {
  const chatId = privateId(me.uid, other.uid);
  const existing = await get(ref(db, `chats/${chatId}`));
  if (!existing.exists()) {
    await set(ref(db, `chats/${chatId}`), {
      id: chatId,
      type: "private",
      name: "",
      color: other.color || colorFrom(other.username),
      members: { [me.uid]: "member", [other.uid]: "member" },
      peers: { [me.uid]: other.uid, [other.uid]: me.uid },
      createdBy: me.uid,
      createdAt: Date.now(),
    });
  }
  const stamp = Date.now();
  await update(ref(db, `inbox/${me.uid}/${chatId}`), {
    chatId,
    type: "private",
    peerId: other.uid,
    unread: 0,
    updatedAt: stamp,
  });
  await update(ref(db, `inbox/${other.uid}/${chatId}`), {
    chatId,
    type: "private",
    peerId: me.uid,
    unread: 0,
    updatedAt: stamp,
  });
  return chatId;
}

export async function createRoom({ type, name, me, memberIds = [] }) {
  const chatId = push(child(ref(db), "chats")).key;
  const members = { [me.uid]: "owner" };
  for (const id of memberIds) members[id] = "member";
  const chat = {
    id: chatId,
    type,
    name: name.trim() || (type === "group" ? "Новая группа" : "Новый канал"),
    color: colorFrom(name),
    members,
    rolePermissions: {
      owner: { addMembers: true, manageMessages: true, editInfo: true, manageRoles: true },
      admin: { addMembers: true, manageMessages: true, editInfo: true, manageRoles: true },
      moderator: { addMembers: true, manageMessages: true, editInfo: false, manageRoles: false },
      member: { addMembers: false, manageMessages: false, editInfo: false, manageRoles: false },
    },
    public: type === "group" || type === "channel",
    createdBy: me.uid,
    createdAt: Date.now(),
    description: "",
  };
  await set(ref(db, `chats/${chatId}`), chat);
  const stamp = Date.now();
  for (const uid of Object.keys(members)) {
    await set(ref(db, `inbox/${uid}/${chatId}`), {
      chatId,
      type,
      unread: 0,
      updatedAt: stamp,
    });
  }
  await sendMessage(chatId, {
    senderId: me.uid,
    kind: "system",
    text: type === "group" ? "Группа создана" : "Канал создан",
  });
  return chatId;
}

export async function createCommunityInvitation({ chatId, fromUid, toUid, chatTitle, chatType }) {
  if (!chatId || !fromUid || !toUid) throw new Error("invalid-invite");
  const id = push(child(ref(db), "communityInvitations")).key;
  await set(ref(db, `communityInvitations/${toUid}/${id}`), {
    id, chatId, fromUid, toUid, chatTitle: chatTitle || "Сообщество", chatType: chatType || "group", status: "pending", at: Date.now(),
  });
  return id;
}

export async function addMember(chatId, uid, actorUid = null) {
  const snap = await get(ref(db, `chats/${chatId}`));
  const chat = snap.exists() ? snap.val() || {} : {};
  if (chat.type === "group" && actorUid) {
    const role = (chat.members || {})[actorUid] || "member";
    const perms = chat.rolePermissions?.[role] || {};
    if (role !== "owner" && !perms.addMembers) throw new Error("group-permission-denied");
  }
  if (actorUid && uid !== actorUid) {
    const target = await loadProfile(uid);
    const mode = target?.settings?.whoCanAdd || "contacts";
    if (mode === "contacts") {
      const contactSnap = await get(ref(db, `contacts/${uid}/${actorUid}`));
      if (!contactSnap.exists()) throw new Error("privacy-add-denied");
    }
  }
  await update(ref(db, `chats/${chatId}/members`), { [uid]: "member" });
  await set(ref(db, `inbox/${uid}/${chatId}`), {
    chatId,
    unread: 0,
    updatedAt: Date.now(),
  });
}

export async function setMemberRole(chatId, uid, role, actorUid = null) {
  const allowed = new Set(["admin", "moderator", "member"]);
  if (!allowed.has(role)) throw new Error("invalid-role");
  const snap = await get(ref(db, `chats/${chatId}`));
  const chat = snap.exists() ? snap.val() || {} : {};
  if (chat.type === "group" && actorUid) {
    const actorRole = (chat.members || {})[actorUid] || "member";
    const perms = chat.rolePermissions?.[actorRole] || {};
    if (actorRole !== "owner" && !perms.manageRoles) throw new Error("group-permission-denied");
  }
  await update(ref(db, `chats/${chatId}/members`), { [uid]: role });
}

export async function patchInbox(uid, chatId, patch) {
  await update(ref(db, `inbox/${uid}/${chatId}`), patch);
}

export async function addContact(uid, otherUid) {
  await set(ref(db, `contacts/${uid}/${otherUid}`), { at: Date.now() });
}

export async function removeContact(uid, otherUid) {
  await remove(ref(db, `contacts/${uid}/${otherUid}`));
}

export function listenContacts(uid, cb) {
  return onValue(ref(db, `contacts/${uid}`), (s) => cb(s.val() || {}));
}

export async function isContact(ownerUid, otherUid) {
  if (!ownerUid || !otherUid) return false;
  const snap = await get(ref(db, `contacts/${ownerUid}/${otherUid}`));
  return snap.exists();
}

export async function setTyping(chatId, uid, on) {
  const r = ref(db, `typing/${chatId}/${uid}`);
  if (on) await set(r, Date.now());
  else await remove(r);
}

export function listenTyping(chatId, cb) {
  return onValue(ref(db, `typing/${chatId}`), (s) => cb(s.val() || {}));
}

function blobToUint8Array(blob) {
  return blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
}


export function listenCall(chatId, cb) {
  return onValue(ref(db, `calls/${chatId}`), (s) => cb(s.val()));
}

export async function writeCall(chatId, data) {
  await set(ref(db, `calls/${chatId}`), { ...data, at: Date.now() });
}

export async function patchCall(chatId, patch) {
  await update(ref(db, `calls/${chatId}`), patch);
}

export async function pushIce(chatId, side, cand) {
  await push(ref(db, `calls/${chatId}/ice/${side}`), cand);
}

export function listenIce(chatId, side, cb) {
  return onChildAdded(ref(db, `calls/${chatId}/ice/${side}`), (s) => cb(s.val()));
}

export async function endCall(chatId, extra = {}) {
  await update(ref(db, `calls/${chatId}`), { status: "ended", at: Date.now(), ...extra });
}

export async function ringUser(uid, payload) {
  await set(ref(db, `incoming/${uid}`), { ...payload, at: Date.now() });
}

export function listenIncoming(uid, cb) {
  return onValue(ref(db, `incoming/${uid}`), (s) => cb(s.val()));
}

export async function clearIncoming(uid) {
  await remove(ref(db, `incoming/${uid}`));
}


export function listenGroupCall(chatId, cb) {
  return onValue(ref(db, `calls/${chatId}`), (s) => cb(s.val()));
}

export function listenGroupParticipants(chatId, cb) {
  return onValue(ref(db, `calls/${chatId}/participants`), (s) => cb(s.val() || {}));
}

export async function getGroupParticipantsOnce(chatId) {
  const snap = await get(ref(db, `calls/${chatId}/participants`));
  return snap.val() || {};
}

export async function setGroupParticipant(chatId, uid, data) {
  await set(ref(db, `calls/${chatId}/participants/${uid}`), { ...data, uid, at: Date.now() });
}

export async function removeGroupParticipant(chatId, uid) {
  await remove(ref(db, `calls/${chatId}/participants/${uid}`));
}

export async function writeGroupSignal(chatId, pairKey, side, data) {
  await set(ref(db, `calls/${chatId}/signals/${pairKey}/${side}`), { ...data, at: Date.now() });
}

export function listenGroupSignals(chatId, cb) {
  return onValue(ref(db, `calls/${chatId}/signals`), (s) => cb(s.val() || {}));
}

export async function pushGroupIce(chatId, pairKey, side, cand) {
  await push(ref(db, `calls/${chatId}/signals/${pairKey}/ice/${side}`), cand);
}

export function listenGroupIce(chatId, pairKey, side, cb) {
  return onChildAdded(ref(db, `calls/${chatId}/signals/${pairKey}/ice/${side}`), (s) => cb(s.val()));
}

export async function sendSupport({ uid, topic, text }) {
  const id = push(child(ref(db), "support")).key;
  await set(ref(db, `support/${id}`), { uid, topic, text, at: Date.now() });
}

export function authError(err) {
  const code = err?.code || err?.message || String(err);
  const map = {
    "auth/email-already-in-use": "Этот email уже зарегистрирован",
    "auth/invalid-email": "Некорректный email",
    "auth/weak-password": "Пароль слишком короткий (минимум 6 символов)",
    "auth/user-not-found": "Аккаунт не найден",
    "auth/wrong-password": "Неверный пароль",
    "auth/invalid-credential": "Неверный email или пароль",
    "auth/too-many-requests": "Слишком много попыток, подождите",
    "auth/operation-not-allowed": "Вход по email/паролю отключён в Firebase. В Firebase Console включите Authentication → Sign-in method → Email/Password.",
    "privacy-add-denied": "Пользователь разрешает добавление в группы только своим контактам.",
    "auth/unauthorized-domain": "Домен не разрешён для авторизации",
    "auth/requires-recent-login": "Нужно повторно подтвердить пароль",
    "auth/email-not-verified": "Подтвердите email. Мы не можем завершить вход без подтверждения.",
    "auth/invalid-verification-code": "Неверный код. Введите 6 цифр из приложения-аутентификатора.",
    "auth/mfa-resolver-missing": "Сессия подтверждения 2FA истекла. Войдите заново.",
    "auth/mfa-factor-missing": "Фактор 2FA не найден.",
    "auth/requires-recent-login": "Для изменения 2FA нужно недавно войти в аккаунт.",
    "auth/no-current-user": "Пользователь не авторизован",
    "push-insecure-context": "Уведомления доступны только через защищённое HTTPS-соединение.",
    "push-unsupported": "Этот браузер не поддерживает push-уведомления.",
    "push-permission-denied": "Доступ к уведомлениям запрещён в браузере.",
    "push-token-empty": "Не удалось получить токен уведомлений.",
    "verification-rate-limited": "Письмо уже недавно отправлялось. Проверьте входящие и попробуйте позже." ,
    "auth/network-request-failed": "Нет связи с сервером. Проверьте сеть.",
    "network-request-failed": "Нет связи с сервером. Проверьте сеть.",
    "username-taken": "Этот @username уже занят",
    "username-short": "Юзернейм: минимум 3 символа (a-z, 0-9, _)",
    "user-blocked": "Этот пользователь вас заблокировал",
    "chat-not-found": "Чат не найден",
  };
  if (map[code]) return map[code];
  if (map[err?.message]) return map[err.message];
  return err?.message || "Ошибка сервера";
}

export {
  ref,
  get,
  set,
  update,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
};
