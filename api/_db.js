import { createClient } from '@libsql/client';
import { randomBytes } from 'node:crypto';

let client;
function getDb() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }
  client ??= createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return client;
}

const CREATE_USERS = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

let ready;
export function ensureUsersTable() {
  ready ??= (async () => {
    const { rows } = await getDb().execute('PRAGMA table_info(users)');
    // Migrate the first version of the table (name only) to the new shape
    if (rows.length && !rows.some(r => r.name === 'slug')) {
      await getDb().execute('ALTER TABLE users RENAME TO users_old');
      await getDb().execute(CREATE_USERS);
      const old = await getDb().execute('SELECT name FROM users_old');
      for (const r of old.rows) {
        await getDb().execute({
          sql: 'INSERT INTO users (slug, name, wedding_date) VALUES (?, ?, ?)',
          args: [newSlug(), r.name, '2026-12-05T00:00'],
        });
      }
      await getDb().execute('DROP TABLE users_old');
    }
    await getDb().execute(CREATE_USERS);
  })().catch(err => {
    ready = undefined;
    throw err;
  });
  return ready;
}

function newSlug() {
  return randomBytes(4).toString('hex');
}

export async function addUser(name, weddingDate) {
  await ensureUsersTable();
  const slug = newSlug();
  await getDb().execute({
    sql: 'INSERT INTO users (slug, name, wedding_date) VALUES (?, ?, ?)',
    args: [slug, name, weddingDate],
  });
  return getUser(slug);
}

export async function getUser(slug) {
  await ensureUsersTable();
  const { rows } = await getDb().execute({
    sql: 'SELECT slug, name, wedding_date, created_at FROM users WHERE slug = ?',
    args: [slug],
  });
  return rows[0] ?? null;
}
