import { addUser, getUser, listUsers } from './_db.js';
import { createToken } from './_auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const slug = String(req.query.slug || '');
      if (!slug) return res.status(200).json(await listUsers());
      const user = await getUser(slug);
      return user ? res.status(200).json(user) : res.status(404).json({ error: 'Not found' });
    }
    if (req.method === 'POST') {
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      const nameEn = typeof req.body?.nameEn === 'string' ? req.body.nameEn.trim().slice(0, 100) : '';
      const weddingDate = typeof req.body?.weddingDate === 'string' ? req.body.weddingDate : '';
      const pin = typeof req.body?.pin === 'string' ? req.body.pin : '';
      const time = new Date(weddingDate).getTime();
      if (!name || name.length > 100) return res.status(400).json({ error: 'name is required' });
      if (Number.isNaN(time) || time <= Date.now()) return res.status(400).json({ error: 'date must be in the future' });
      if (pin.length < 4 || pin.length > 64) return res.status(400).json({ error: 'code must be 4-64 characters' });
      // Fail before saving if sessions aren't configured, so a retry doesn't create duplicates
      createToken('check');
      const user = await addUser(name, nameEn, weddingDate, pin);
      return res.status(201).json({ user, token: createToken(user.slug) });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
