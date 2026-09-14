import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function ensureUsersTable() {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
}

export async function addUser(name) {
  await ensureUsersTable();
  await db.execute({ sql: 'INSERT OR IGNORE INTO users (name) VALUES (?)', args: [name] });
  const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE name = ?', args: [name] });
  return rows[0];
}
