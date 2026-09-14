import { db, ensureUsersTable, addUser } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      await ensureUsersTable();
      const { rows } = await db.execute('SELECT * FROM users ORDER BY id');
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      if (!name) return res.status(400).json({ error: 'name is required' });
      return res.status(201).json(await addUser(name));
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
