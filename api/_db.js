import { createClient } from '@libsql/client';
import { randomBytes } from 'node:crypto';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

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
    const { rows } = await db.execute('PRAGMA table_info(users)');
    // Migrate the first version of the table (name only) to the new shape
    if (rows.length && !rows.some(r => r.name === 'slug')) {
      await db.execute('ALTER TABLE users RENAME TO users_old');
      await db.execute(CREATE_USERS);
      const old = await db.execute('SELECT name FROM users_old');
      for (const r of old.rows) {
        await db.execute({
          sql: 'INSERT INTO users (slug, name, wedding_date) VALUES (?, ?, ?)',
          args: [newSlug(), r.name, '2026-12-05T00:00'],
        });
      }
      await db.execute('DROP TABLE users_old');
    }
    await db.execute(CREATE_USERS);
  })();
  return ready;
}

function newSlug() {
  return randomBytes(4).toString('hex');
}

export async function addUser(name, weddingDate) {
  await ensureUsersTable();
  const slug = newSlug();
  await db.execute({
    sql: 'INSERT INTO users (slug, name, wedding_date) VALUES (?, ?, ?)',
    args: [slug, name, weddingDate],
  });
  return getUser(slug);
}

export async function getUser(slug) {
  await ensureUsersTable();
  const { rows } = await db.execute({
    sql: 'SELECT slug, name, wedding_date, created_at FROM users WHERE slug = ?',
    args: [slug],
  });
  return rows[0] ?? null;
}
