import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
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
  getStorage,
  ref as sref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCjadRD1TAix0IsjaxYI-76P9mDpKmQ34Q",
  authDomain: "quickchat-f5012.firebaseapp.com",
  databaseURL: "https://quickchat-f5012-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quickchat-f5012",
  storageBucket: "quickchat-f5012.firebasestorage.app",
  messagingSenderId: "80730246249",
  appId: "1:80730246249:web:b3b444c63aca7a5c7466f8",
  measurementId: "G-B7MFW899QJ",
};

let app, auth, db, storage;
export function getFb() {
  return { app, auth, db, storage };
}

export async function boot() {
  if (app) return getFb();
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  storage = getStorage(app);
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    /* ignore */
  }
  return getFb();
}

export function onUser(cb) {
  return onAuthStateChanged(auth, cb);
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
  return cred.user;
}

export async function login({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function logout() {
  if (auth.currentUser) {
    try {
      await set(ref(db, `presence/${auth.currentUser.uid}`), { online: false, at: Date.now() });
    } catch {
      /* ignore */
    }
  }
  await signOut(auth);
}

export function defaultSettings() {
  return {
    theme: "midnight",
    notifications: true,
    messagePreview: true,
    sounds: true,
    reduceMotion: false,
    locale: "ru",
    twoFA: false,
    whoCanMessage: "everyone",
    whoCanCall: "contacts",
    whoCanAdd: "contacts",
  };
}

export function colorFrom(seed) {
  const palette = ["#3D8BFD", "#2A9D8F", "#4A6FA5", "#1D8A99", "#5EA0FF", "#3B6FE0", "#2F6FED", "#149C78"];
  let h = 0;
  const s = String(seed || "n");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export async function loadProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
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

export function listenProfile(uid, cb) {
  return onValue(ref(db, `users/${uid}`), (s) => cb(s.val()));
}

export function listenPresence(uid, cb) {
  return onValue(ref(db, `presence/${uid}`), (s) => cb(s.val() || { online: false }));
}

export async function setPresence(uid) {
  const p = ref(db, `presence/${uid}`);
  await set(p, { online: true, at: Date.now() });
  onDisconnect(p).set({ online: false, at: Date.now() });
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

export async function sendMessage(chatId, msg) {
  const id = push(child(ref(db), `messages/${chatId}`)).key;
  const payload = {
    ...msg,
    createdAt: Date.now(),
  };
  await set(ref(db, `messages/${chatId}/${id}`), payload);
  const preview =
    msg.kind === "image"
      ? "📷"
      : msg.kind === "voice"
        ? "🎤"
        : msg.kind === "call"
          ? "📞"
          : String(msg.text || "").slice(0, 140);
  await update(ref(db, `chats/${chatId}`), {
    lastText: preview,
    lastAt: Date.now(),
    lastSender: msg.senderId,
    lastKind: msg.kind || "text",
  });
  const chat = (await get(ref(db, `chats/${chatId}`))).val();
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

export async function addMember(chatId, uid) {
  await update(ref(db, `chats/${chatId}/members`), { [uid]: "member" });
  await set(ref(db, `inbox/${uid}/${chatId}`), {
    chatId,
    unread: 0,
    updatedAt: Date.now(),
  });
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

export function setTyping(chatId, uid, on) {
  const r = ref(db, `typing/${chatId}/${uid}`);
  if (on) set(r, Date.now());
  else remove(r);
}

export function listenTyping(chatId, cb) {
  return onValue(ref(db, `typing/${chatId}`), (s) => cb(s.val() || {}));
}

export async function uploadMedia(uid, file, folder = "media") {
  const ext = (file.name && file.name.split(".").pop()) || "bin";
  const path = `${folder}/${uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = sref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || "application/octet-stream" });
  return getDownloadURL(r);
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

export async function endCall(chatId) {
  await update(ref(db, `calls/${chatId}`), { status: "ended", at: Date.now() });
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
    "auth/operation-not-allowed": "Email/пароль не включены в Firebase Auth",
    "auth/unauthorized-domain": "Домен не добавлен в Authorized domains Firebase",
    "auth/network-request-failed": "Нет связи с Firebase. Проверьте сеть.",
    "network-request-failed": "Нет связи с Firebase. Проверьте сеть.",
    "username-taken": "Этот @username уже занят",
    "username-short": "Юзернейм: минимум 3 символа (a-z, 0-9, _)",
  };
  if (map[code]) return map[code];
  if (map[err?.message]) return map[err.message];
  return err?.message || "Ошибка Firebase";
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
