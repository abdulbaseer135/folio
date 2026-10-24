import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { MongoRepository } from './repository.js';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
const { MONGODB_URI, JWT_SECRET } = process.env;
if (!MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure it.');
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const repo = new MongoRepository();
await repo.init();
const app = createApp({ repo, jwtSecret: JWT_SECRET, demoMode: process.env.DEMO_MODE === 'true' });
const server = app.listen(process.env.PORT || 3001, '0.0.0.0', () => console.log(`Folio listening on port ${process.env.PORT || 3001}`));
async function stop() { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); setTimeout(() => process.exit(1), 10000).unref(); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
