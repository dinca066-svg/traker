import { serialize, parse } from 'cookie';

const PIN = process.env.AUTH_PIN || '1234';
const COOKIE_NAME = 'tracker-auth';
const SECRET = process.env.AUTH_SECRET || 'tracker-secret-key-change-me';

function makeToken() {
  // Simple hash: timestamp + secret
  const ts = Date.now().toString(36);
  const hash = Buffer.from(SECRET + ts).toString('base64').slice(0, 16);
  return `${ts}.${hash}`;
}

function verifyToken(token) {
  if (!token) return false;
  const [ts] = token.split('.');
  if (!ts) return false;
  // Token valid for 30 days
  const created = parseInt(ts, 36);
  const age = Date.now() - created;
  return age < 30 * 24 * 60 * 60 * 1000;
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { pin } = req.body || {};
    if (String(pin) === String(PIN)) {
      const token = makeToken();
      res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }));
      return res.json({ ok: true });
    }
    return res.status(401).json({ error: 'Неверный PIN' });
  }

  if (req.method === 'GET') {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    return res.json({ authenticated: verifyToken(token) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    }));
    return res.json({ ok: true });
  }

  res.status(405).end();
}
