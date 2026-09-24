import { createClient } from '@libsql/client/web';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

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
    const newColumns = {
      name_en: 'TEXT',
      pin_hash: 'TEXT',
      bio: 'TEXT',
      photo: 'TEXT',
      show_bio: 'INTEGER DEFAULT 1',
      show_photo: 'INTEGER DEFAULT 1',
      photo_thumb: 'TEXT',
    };
    for (const [col, type] of Object.entries(newColumns)) {
      if (!cols.rows.some(r => r.name === col)) {
        await getDb().execute(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
      }
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

// Stored as "salt:hash". A value without ":" is a plain PIN typed directly into the database.
export function hashPin(pin) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pin, salt, 32).toString('hex')}`;
}

function verifyPin(pin, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.includes(':') ? stored.split(':') : [null, null];
  const expected = salt ? Buffer.from(hash, 'hex') : Buffer.from(stored);
  const actual = salt ? scryptSync(pin, salt, 32) : Buffer.from(pin);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function addUser(name, nameEn, weddingDate, pin) {
  await ensureUsersTable();
  const slug = newSlug();
  await getDb().execute({
    sql: 'INSERT INTO users (slug, name, name_en, wedding_date, pin_hash) VALUES (?, ?, ?, ?, ?)',
    args: [slug, name, nameEn || null, weddingDate, hashPin(pin)],
  });
  return getUser(slug);
}

// Public view: bio and photo only when the owner chose to show them
const PUBLIC_COLUMNS = `slug, name, name_en, wedding_date, created_at,
  CASE WHEN show_bio = 1 THEN bio END AS bio,
  CASE WHEN show_photo = 1 THEN photo END AS photo,
  CASE WHEN show_photo = 1 THEN photo_thumb END AS photo_thumb`;

export async function listUsers() {
  await ensureUsersTable();
  // Default user first, then newest; photos are left out to keep the list small
  const { rows } = await getDb().execute(
    `SELECT slug, name, name_en, wedding_date,
      CASE WHEN show_photo = 1 THEN COALESCE(photo_thumb, photo) END AS photo_thumb FROM users
     ORDER BY slug = '${DEFAULT_SLUG}' DESC, id DESC LIMIT 200`
  );
  return rows;
}

export async function getUser(slug) {
  await ensureUsersTable();
  const { rows } = await getDb().execute({
    sql: `SELECT ${PUBLIC_COLUMNS} FROM users WHERE slug = ?`,
    args: [slug],
  });
  return rows[0] ?? null;
}

export async function checkPin(slug, pin) {
  await ensureUsersTable();
  const { rows } = await getDb().execute({ sql: 'SELECT pin_hash FROM users WHERE slug = ?', args: [slug] });
  const stored = rows[0]?.pin_hash;
  if (!verifyPin(pin, stored)) return false;
  if (!stored.includes(':')) {
    await getDb().execute({ sql: 'UPDATE users SET pin_hash = ? WHERE slug = ?', args: [hashPin(pin), slug] });
  }
  return true;
}

export async function deleteUser(slug) {
  await ensureUsersTable();
  await getDb().execute({ sql: 'DELETE FROM users WHERE slug = ?', args: [slug] });
}

export async function getProfile(slug) {
  await ensureUsersTable();
  const { rows } = await getDb().execute({
    sql: `SELECT slug, name, name_en, wedding_date, bio, photo, photo_thumb, show_bio, show_photo FROM users WHERE slug = ?`,
    args: [slug],
  });
  return rows[0] ?? null;
}

export async function updateProfile(slug, { bio, photo, photoThumb, showBio, showPhoto }) {
  await ensureUsersTable();
  await getDb().execute({
    sql: 'UPDATE users SET bio = ?, photo = ?, photo_thumb = ?, show_bio = ?, show_photo = ? WHERE slug = ?',
    args: [bio || null, photo || null, photoThumb || null, showBio ? 1 : 0, showPhoto ? 1 : 0, slug],
  });
  return getProfile(slug);
}
