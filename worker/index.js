const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUAuTuIjtCB1-gIEJn4z1wZ5BaZ1O5bCFQrif_1rP2o8MwkrPvlzQFqvfrNbq75noZ/exec';
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ status: 'ok', version: '3.0' });
    if (url.pathname === '/data') {
      try {
        const resp = await fetch(APPS_SCRIPT_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
        const data = await resp.text();
        return new Response(data, { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } });
      } catch(e) { return json({ error: e.message }, 502); }
    }
    return json({ error: 'Use /data or /health' }, 404);
  }
};
function cors() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }; }
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...cors() } }); }
