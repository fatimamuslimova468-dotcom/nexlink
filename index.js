const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth');

initializeApp();

exports.qrLoginExchange = onRequest({ region: 'europe-west1', cors: true }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });
  const { sessionId, secret } = req.body || {};
  if (!sessionId || !secret) return res.status(400).json({ error: 'missing-qr-session' });

  const db = getDatabase();
  const sessionRef = db.ref(`qrLoginSessions/${sessionId}`);
  const snap = await sessionRef.get();
  const session = snap.val();
  if (!session) return res.status(404).json({ error: 'qr-session-not-found' });
  if (session.secret !== secret) return res.status(403).json({ error: 'qr-session-invalid' });
  if (Number(session.expiresAt || 0) < Date.now()) return res.status(410).json({ error: 'qr-session-expired' });
  if (session.status !== 'approved' || !session.approvedBy) return res.status(409).json({ error: 'qr-session-not-approved' });
  if (session.consumedAt) return res.status(409).json({ error: 'qr-session-consumed' });

  const customToken = await getAuth().createCustomToken(String(session.approvedBy));
  await sessionRef.update({ status: 'consumed', consumedAt: Date.now() });
  return res.json({ customToken });
});
