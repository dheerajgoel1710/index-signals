const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUAuTuIjtCB1-gIEJn4z1wZ5BaZ1O5bCFQrif_1rP2o8MwkrPvlzQFqvfrNbq75noZ/exec';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });

    const url = new URL(request.url);
    const path = url.pathname;

    // Health
    if (path === '/health') return json({ status: 'ok', version: '4.0', kv: !!env.BET_JOURNAL });

    // Market data from Google Sheets
    if (path === '/data') {
      try {
        const resp = await fetch(APPS_SCRIPT_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
        const data = await resp.text();
        return new Response(data, { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } });
      } catch(e) { return json({ error: e.message }, 502); }
    }

    // KV storage endpoints
    if (path.startsWith('/kv/')) {
      if (!env.BET_JOURNAL) return json({ error: 'KV not configured' }, 503);
      const key = path.replace('/kv/', '');
      if (!key) return json({ error: 'No key' }, 400);

      if (request.method === 'GET') {
        const val = await env.BET_JOURNAL.get(key);
        if (val === null) return json({ value: null });
        return new Response(val, { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } });
      }

      if (request.method === 'PUT') {
        const body = await request.text();
        await env.BET_JOURNAL.put(key, body);
        return json({ ok: true });
      }

      if (request.method === 'DELETE') {
        await env.BET_JOURNAL.delete(key);
        return json({ ok: true });
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}
