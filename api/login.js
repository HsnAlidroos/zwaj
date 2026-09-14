import { checkPin } from './_db.js';
import { createToken } from './_auth.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const slug = String(req.body?.slug || '');
    const pin = String(req.body?.pin || '');
    if (!slug || !pin || !(await checkPin(slug, pin))) {
      return res.status(401).json({ error: 'Wrong code' });
    }
    return res.status(200).json({ token: createToken(slug) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
