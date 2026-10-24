import mongoose from 'mongoose';
import { USERS, WELCOME, WELCOME_ID } from './demo.js';
const userSchema = new mongoose.Schema({ _id: String, name: String, email: { type: String, unique: true }, initials: String, color: String });
const docSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  ownerId: { type: String, required: true, index: true },
  sharedWith: { type: [String], default: [], index: true },
  version: { type: Number, default: 0 },
  sourceName: { type: String, default: null }
}, { timestamps: true, versionKey: false });
const User = mongoose.model('User', userSchema);
const Doc = mongoose.model('Document', docSchema);
const dto = doc => doc && ({ id: String(doc._id), title: doc.title, content: doc.content, ownerId: doc.ownerId, sharedWith: doc.sharedWith, version: doc.version, sourceName: doc.sourceName, createdAt: doc.createdAt, updatedAt: doc.updatedAt });
const accessible = userId => ({ $or: [{ ownerId: userId }, { sharedWith: userId }] });
export class MongoRepository {
  async init() {
    await Promise.all([User.init(), Doc.init()]);
    for (const user of USERS) {
      const { id, ...rest } = user;
      await User.updateOne({ _id: id }, { $setOnInsert: rest }, { upsert: true });
    }
    await Doc.updateOne({ _id: WELCOME_ID }, { $setOnInsert: { title: 'Welcome to Folio', content: WELCOME, ownerId: 'abdul', sharedWith: [], version: 0 } }, { upsert: true });
  }
  async health() { await mongoose.connection.db.admin().ping(); }
  async users() { return (await User.find().lean()).map(({ _id, __v, ...u }) => ({ id: _id, ...u })); }
  async user(id) { const u = await User.findById(id).lean(); return u && { id: u._id, name: u.name, email: u.email, initials: u.initials, color: u.color }; }
  async userByEmail(email) { const u = await User.findOne({ email }).lean(); return u && { id: u._id, name: u.name, email: u.email, initials: u.initials, color: u.color }; }
  async list(userId) { return (await Doc.find(accessible(userId)).select('-content').sort({ updatedAt: -1 }).lean()).map(dto); }
  async get(id) { return dto(await Doc.findById(id).lean()); }
  async create(data) { return dto((await Doc.create(data)).toObject()); }
  async save(id, userId, version, patch) {
    return dto(await Doc.findOneAndUpdate({ _id: id, version, ...accessible(userId) }, { $set: patch, $inc: { version: 1 } }, { new: true, runValidators: true }).lean());
  }
  async grant(id, ownerId, userId) { return dto(await Doc.findOneAndUpdate({ _id: id, ownerId }, { $addToSet: { sharedWith: userId } }, { new: true }).lean()); }
  async revoke(id, ownerId, userId) { return dto(await Doc.findOneAndUpdate({ _id: id, ownerId }, { $pull: { sharedWith: userId } }, { new: true }).lean()); }
}
