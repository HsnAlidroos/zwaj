import { DEFAULT_SLUG, checkPin, deleteUser, getProfile, updateProfile } from './_db.js';
import { getSessionSlug } from './_auth.js';

const MAX_BIO = 500;
const MAX_PHOTO = 400_000; // characters of the data URL (~300KB image)

export default async function handler(req, res) {
  try {
    const slug = getSessionSlug(req);
    if (!slug) return res.status(401).json({ error: 'Not signed in' });

    if (req.method === 'GET') {
      return res.status(200).json(await getProfile(slug));
    }
    if (req.method === 'PATCH') {
      const { bio, photo, photoThumb, showBio, showPhoto } = req.body || {};
      if (bio != null && (typeof bio !== 'string' || bio.length > MAX_BIO)) {
        return res.status(400).json({ error: 'bio is too long' });
      }
      for (const image of [photo, photoThumb]) {
        if (image != null && (typeof image !== 'string' || !image.startsWith('data:image/') || image.length > MAX_PHOTO)) {
          return res.status(400).json({ error: 'invalid photo' });
        }
      }
      return res.status(200).json(await updateProfile(slug, { bio, photo, photoThumb, showBio: !!showBio, showPhoto: !!showPhoto }));
    }
    if (req.method === 'DELETE') {
      // The default countdown is recreated automatically, so it can't be deleted
      if (slug === DEFAULT_SLUG) return res.status(403).json({ error: 'The default countdown cannot be deleted' });
      const pin = String(req.body?.pin || '');
      if (!pin || !(await checkPin(slug, pin))) return res.status(401).json({ error: 'Wrong code' });
      await deleteUser(slug);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
