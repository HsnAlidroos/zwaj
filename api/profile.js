import { getProfile, updateProfile } from './_db.js';
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
      const { bio, photo, showBio, showPhoto } = req.body || {};
      if (bio != null && (typeof bio !== 'string' || bio.length > MAX_BIO)) {
        return res.status(400).json({ error: 'bio is too long' });
      }
      if (photo != null && (typeof photo !== 'string' || !photo.startsWith('data:image/') || photo.length > MAX_PHOTO)) {
        return res.status(400).json({ error: 'invalid photo' });
      }
      return res.status(200).json(await updateProfile(slug, { bio, photo, showBio: !!showBio, showPhoto: !!showPhoto }));
    }
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
