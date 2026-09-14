import { createHmac, timingSafeEqual } from 'node:crypto';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function sign(value) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createToken(slug) {
  const payload = `${slug}.${Date.now() + THIRTY_DAYS}`;
  return `${payload}.${sign(payload)}`;
}

// Returns the slug the request is signed in as, or null
export function getSessionSlug(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
  const [slug, expiry, signature] = token.split('.');
  if (!slug || !expiry || !signature || Number(expiry) < Date.now()) return null;
  const expected = Buffer.from(sign(`${slug}.${expiry}`));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? slug : null;
}
