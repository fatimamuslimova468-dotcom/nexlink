const KEY_STORE = "nexlink-e2ee-v1";
let myKeys = null;
let userId = null;

function b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function unb64(str) { return Uint8Array.from(atob(str), c => c.charCodeAt(0)); }

export async function e2eeInit(uid) {
  userId = uid;
  const saved = localStorage.getItem(KEY_STORE);
  if (saved) {
    myKeys = JSON.parse(saved);
    return;
  }
  const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
  const pub = await crypto.subtle.exportKey("jwk", kp.publicKey);
  const priv = await crypto.subtle.exportKey("jwk", kp.privateKey);
  myKeys = { publicKey: pub, privateKey: priv, uid };
  localStorage.setItem(KEY_STORE, JSON.stringify(myKeys));
}

export function isE2EEReady() { return !!myKeys && !!userId; }
export async function getPublicKeyJwk() { return myKeys?.publicKey || null; }

async function importPublic(jwk) {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, []);
}
async function importPrivate(jwk) {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
}

// End-to-end encrypted message layer using ECDH P-256 + AES-GCM.
// Это клиентское E2EE; полноценная серверная мультиустройственная схема в этот модуль не входит.
export async function encryptText(text, chatId, peerPublicKey) {
  if (!isE2EEReady() || !text) return null;
  if (!peerPublicKey) return null;
  const peerPublic = peerPublicKey;
  const priv = await importPrivate(myKeys.privateKey);
  const pub = await importPublic(peerPublic);
  const key = await crypto.subtle.deriveKey({ name: "ECDH", public: pub }, priv, { name: "AES-GCM", length: 256 }, false, ["encrypt","decrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(text);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { version: 1, scheme: "ECDH-P256-AESGCM", iv: b64(iv), ciphertext: b64(cipher), publicKey: peerPublic, chatId };
}

export async function decryptMessageText(msg, chatId) {
  if (!msg?.e2ee?.ciphertext) return msg?.text || "";
  try {
    const priv = await importPrivate(myKeys.privateKey);
    const pub = await importPublic(msg.e2ee.publicKey || myKeys.publicKey);
    const key = await crypto.subtle.deriveKey({ name: "ECDH", public: pub }, priv, { name: "AES-GCM", length: 256 }, false, ["encrypt","decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(msg.e2ee.iv) }, key, unb64(msg.e2ee.ciphertext));
    return new TextDecoder().decode(plain);
  } catch {
    return "🔒 Зашифрованное сообщение";
  }
}
