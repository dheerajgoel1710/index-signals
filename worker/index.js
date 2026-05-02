const MASSIVE_API_KEY = 'xJZqx4UnoaqvQSoe2QhLtXNzYhmf62M3';
const MASSIVE_BASE    = 'https://api.massive.com';

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response(JSON.stringify({status:'ok'}), {headers:{'Content-Type':'application/json',...cors()}});
    if (!url.pathname.startsWith('/api/')) return new Response(JSON.stringify({error:'Not found'}), {status:404,headers:cors()});
    const path = url.pathname.replace(/^\/api/, '');
    const params = new URLSearchParams(url.search);
    params.set('apiKey', MASSIVE_API_KEY);
    try {
      const resp = await fetch(`${MASSIVE_BASE}/v2${path}?${params.toString()}`, {headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
      const data = await resp.text();
      return new Response(data, {status:resp.status, headers:{'Content-Type':'application/json',...cors()}});
    } catch(e) {
      return new Response(JSON.stringify({error:e.message}), {status:502, headers:cors()});
    }
  }
};
function cors(){return{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type'};}
