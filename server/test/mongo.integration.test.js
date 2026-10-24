import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { emptyContent } from '../src/validation.js';
test('MongoDB repository persistence, atomic version check, and revocation', { skip: !process.env.TEST_MONGODB_URI }, async () => {
  const { default: mongoose } = await import('mongoose');
  const { MongoRepository } = await import('../src/repository.js');
  // Only a fresh, randomly named test database is dropped. Never drop the URI's default database.
  const dbName = `folio_test_${randomUUID().replaceAll('-', '')}`;
  await mongoose.connect(process.env.TEST_MONGODB_URI, { dbName });
  try {
    const repo = new MongoRepository(); await repo.init();
    const doc = await repo.create({ title: 'Mongo test', content: emptyContent(), ownerId: 'abdul', sharedWith: [], version: 0 });
    assert.equal((await new MongoRepository().get(doc.id)).title, 'Mongo test');
    await repo.grant(doc.id, 'abdul', 'maya');
    const [first, second] = await Promise.all([
      repo.save(doc.id, 'abdul', 0, { title: 'Save A', content: emptyContent() }),
      repo.save(doc.id, 'maya', 0, { title: 'Save B', content: emptyContent() })
    ]);
    assert.equal([first, second].filter(Boolean).length, 1);
    assert.equal((await repo.get(doc.id)).version, 1);
    await repo.revoke(doc.id, 'abdul', 'maya');
    assert.equal(await repo.save(doc.id, 'maya', 1, { title: 'Forbidden', content: emptyContent() }), null);
    assert.equal((await repo.list('maya')).some(d => d.id === doc.id), false);
  } finally {
    await mongoose.connection.dropDatabase(); await mongoose.disconnect();
  }
});
