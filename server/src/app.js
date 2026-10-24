import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, HttpError, titleOf, contentOf, documentId, versionOf, emptyContent, textContent, object } from './validation.js';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 262144, files: 1, fields: 0 } });
export function createApp({ repo, jwtSecret, demoMode = true, serveClient = true, logErrors = true }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', async (req, res) => {
    try { await repo.health(); res.json({ status: 'ok' }); }
    catch { res.status(503).json({ error: 'Database is not available.' }); }
  });
  const demoOnly = (req, res, next) => demoMode ? next() : next(new HttpError(403, 'Demo login is disabled.'));
  app.get('/api/demo/users', demoOnly, async (req, res) => res.json(await repo.users()));
  app.post('/api/demo/login', demoOnly, async (req, res) => {
    if (typeof req.body?.userId !== 'string') fail(400, 'Select a demo user.');
    const user = await repo.user(req.body.userId);
    if (!user) fail(400, 'Unknown demo user.');
    const token = jwt.sign({ sub: user.id }, jwtSecret, { algorithm: 'HS256', expiresIn: '8h', issuer: 'folio', audience: 'folio-demo' });
    res.json({ token, user });
  });
  app.use('/api', (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    try {
      const payload = jwt.verify(token || '', jwtSecret, { algorithms: ['HS256'], issuer: 'folio', audience: 'folio-demo' });
      if (typeof payload.sub !== 'string') throw new Error('Invalid identity');
      req.userId = payload.sub;
      next();
    } catch { next(new HttpError(401, 'Your demo session expired. Switch accounts to sign in again.')); }
  });
  const canRead = (doc, id) => doc && (doc.ownerId === id || doc.sharedWith.includes(id));
  async function accessibleDoc(req) {
    const doc = await repo.get(documentId(req.params.id));
    if (!canRead(doc, req.userId)) fail(404, 'Document not found or no longer shared with you.');
    return doc;
  }
  async function ownedDoc(req) {
    const doc = await accessibleDoc(req);
    if (doc.ownerId !== req.userId) fail(403, 'Only the document owner can manage sharing.');
    return doc;
  }
  app.get('/api/users', async (req, res) => res.json(await repo.users()));
  app.get('/api/documents', async (req, res) => res.json(await repo.list(req.userId)));
  app.post('/api/documents', async (req, res) => {
    const title = titleOf(req.body?.title ?? 'Untitled document');
    const content = contentOf(req.body?.content ?? emptyContent());
    res.status(201).json(await repo.create({ title, content, ownerId: req.userId, sharedWith: [], version: 0 }));
  });
  app.post('/api/documents/import', upload.single('file'), async (req, res) => {
    if (!req.file) fail(400, 'Choose a UTF-8 .txt file.');
    if (!/\.txt$/i.test(req.file.originalname)) fail(400, 'Only .txt files are supported.');
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(req.file.buffer); }
    catch { fail(400, 'The file must use UTF-8 text encoding.'); }
    if (/\x00|[\x01-\x08\x0b\x0c\x0e-\x1f]/.test(text)) fail(400, 'The file contains unsupported binary characters.');
    if (!text.trim()) fail(400, 'The uploaded file is empty.');
    const content = contentOf(textContent(text.replace(/^\uFEFF/, '')));
    const sourceName = req.file.originalname.replace(/^.*[\/]/, '').slice(0, 200);
    const title = titleOf(sourceName.replace(/\.txt$/i, '').slice(0, 120).trim() || 'Imported document');
    res.status(201).json(await repo.create({ title, content, sourceName, ownerId: req.userId, sharedWith: [], version: 0 }));
  });
  app.get('/api/documents/:id', async (req, res) => res.json(await accessibleDoc(req)));
  app.patch('/api/documents/:id', async (req, res) => {
    await accessibleDoc(req);
    if (!object(req.body)) fail(400, 'Invalid update.');
    const patch = { title: titleOf(req.body.title), content: contentOf(req.body.content) };
    const updated = await repo.save(req.params.id, req.userId, versionOf(req.body.version), patch);
    if (!updated) {
      await accessibleDoc(req);
      fail(409, 'Another editor saved a newer version. Your local changes are preserved; download a copy before reloading.');
    }
    res.json(updated);
  });
  app.post('/api/documents/:id/shares', async (req, res) => {
    await ownedDoc(req);
    if (typeof req.body?.email !== 'string') fail(400, 'Enter a demo user’s email.');
    const target = await repo.userByEmail(req.body.email.trim().toLowerCase());
    if (!target) fail(400, 'No demo user has that email.');
    if (target.id === req.userId) fail(400, 'You already own this document.');
    res.json(await repo.grant(req.params.id, req.userId, target.id));
  });
  app.delete('/api/documents/:id/shares/:userId', async (req, res) => {
    await ownedDoc(req);
    if (req.params.userId === req.userId) fail(400, 'The owner cannot be removed.');
    res.json(await repo.revoke(req.params.id, req.userId, req.params.userId));
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
  const dist = fileURLToPath(new URL('../../client/dist', import.meta.url));
  if (serveClient && existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error.status || 500;
    let message = error.message || 'Something went wrong.';
    if (error instanceof multer.MulterError) { status = 400; message = error.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Maximum size is 256 KB.' : 'Upload exactly one .txt file, without additional fields.'; }
    if (status >= 500) { if (logErrors) console.error(error); message = 'The server could not complete the request. Please try again.'; }
    res.status(status).json({ error: message });
  });
  return app;
}
