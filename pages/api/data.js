import { supabase } from '../../lib/supabase';
import { parse } from 'cookie';

const COOKIE_NAME = 'tracker-auth';

function isAuth(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  const [ts] = token.split('.');
  if (!ts) return false;
  const created = parseInt(ts, 36);
  return (Date.now() - created) < 30 * 24 * 60 * 60 * 1000;
}

export default async function handler(req, res) {
  if (!isAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: 'category required' });

    try {
      const { data, error } = await supabase
        .from('tracker_data')
        .select('data')
        .eq('category', category)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message });
      }

      const result = data?.data;
      return res.json({ data: result !== null && result !== undefined ? result : [] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { category, data: payload } = req.body;
    if (!category) return res.status(400).json({ error: 'category required' });

    try {
      const { error } = await supabase
        .from('tracker_data')
        .upsert(
          { category, data: payload, updated_at: new Date().toISOString() },
          { onConflict: 'category' }
        );

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
