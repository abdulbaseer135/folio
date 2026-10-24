import { randomBytes } from 'node:crypto';
import { USERS } from '../src/demo.js';
const copy = value => value == null ? value : structuredClone(value);
export class MemoryRepository {
  constructor() { this.documents = new Map(); }
  async health() {}
  async users() { return copy(USERS); }
  async user(id) { return copy(USERS.find(u => u.id === id) || null); }
  async userByEmail(email) { return copy(USERS.find(u => u.email === email) || null); }
  async list(id) { return copy([...this.documents.values()].filter(d => d.ownerId === id || d.sharedWith.includes(id)).map(({ content, ...d }) => d)); }
  async get(id) { return copy(this.documents.get(id) || null); }
  async create(data) {
    const doc = { ...copy(data), id: randomBytes(12).toString('hex'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.documents.set(doc.id, doc); return copy(doc);
  }
  async save(id, userId, version, patch) {
    const doc = this.documents.get(id);
    if (!doc || doc.version !== version || !(doc.ownerId === userId || doc.sharedWith.includes(userId))) return null;
    Object.assign(doc, copy(patch), { version: version + 1, updatedAt: new Date().toISOString() }); return copy(doc);
  }
  async grant(id, ownerId, userId) { const d = this.documents.get(id); if (!d || d.ownerId !== ownerId) return null; if (!d.sharedWith.includes(userId)) d.sharedWith.push(userId); return copy(d); }
  async revoke(id, ownerId, userId) { const d = this.documents.get(id); if (!d || d.ownerId !== ownerId) return null; d.sharedWith = d.sharedWith.filter(x => x !== userId); return copy(d); }
}
