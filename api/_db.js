import { createClient } from '@libsql/client/web';
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
  name_en TEXT,
  wedding_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export const DEFAULT_SLUG = 'hassan';

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
    const cols = await getDb().execute('PRAGMA table_info(users)');
    if (!cols.rows.some(r => r.name === 'name_en')) {
      await getDb().execute('ALTER TABLE users ADD COLUMN name_en TEXT');
    }
    // The default countdown shown on the home page
    await getDb().execute({
      sql: `INSERT INTO users (slug, name, name_en, wedding_date) VALUES (?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET name = excluded.name, name_en = excluded.name_en`,
      args: [DEFAULT_SLUG, 'حسن علوي حسن محمد العيدروس', 'Hassan Alidroos', '2026-12-05T00:00'],
    });
  })().catch(err => {
    ready = undefined;
    throw err;
  });
  return ready;
}

function newSlug() {
  return randomBytes(4).toString('hex');
}

export async function addUser(name, nameEn, weddingDate) {
  await ensureUsersTable();
  const slug = newSlug();
  await getDb().execute({
    sql: 'INSERT INTO users (slug, name, name_en, wedding_date) VALUES (?, ?, ?, ?)',
    args: [slug, name, nameEn || null, weddingDate],
  });
  return getUser(slug);
}

const USER_COLUMNS = 'slug, name, name_en, wedding_date, created_at';

export async function listUsers() {
  await ensureUsersTable();
  // Default user first, then newest
  const { rows } = await getDb().execute(
    `SELECT ${USER_COLUMNS} FROM users ORDER BY slug = '${DEFAULT_SLUG}' DESC, id DESC LIMIT 200`
  );
  return rows;
}

export async function getUser(slug) {
  await ensureUsersTable();
  const { rows } = await getDb().execute({
    sql: `SELECT ${USER_COLUMNS} FROM users WHERE slug = ?`,
    args: [slug],
  });
  return rows[0] ?? null;
}
