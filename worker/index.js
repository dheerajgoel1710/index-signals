const MASSIVE_API_KEY = 'xJZqx4UnoaqvQSoe2QhLtXNzYhmf62M3';
const MASSIVE_BASE    = 'https://api.massive.com';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ status: 'ok', worker: 'massive-proxy', version: '1.0' });
    }

    if (!url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    const path = url.pathname.replace(/^\/api/, '');
    const params = new URLSearchParams(url.search);
    params.set('apiKey', MASSIVE_API_KEY);
    const massiveURL = `${MASSIVE_BASE}/v2${path}?${params.toString()}`;

    try {
      const resp = await fetch(massiveURL, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...cors() }
      });
    } catch (e) {
      return json({ error: e.message }, 502);
    }
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}
