// Handler completo para Vercel - sem dependências externas
const https = require('https');
const querystring = require('querystring');

// Configuração
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace('https://', '').replace('http://', '');
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[API] SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
console.log('[API] SUPABASE_KEY:', SUPABASE_KEY ? '✓' : '✗');

// Função para fazer requisições HTTPS
function makeSupabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('[API] Request error:', error.message);
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Handler principal
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = req.url;
    const method = req.method;

    console.log(`[API] ${method} ${url}`);

    // Parse body
    let body = null;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      body = req.body || {};
    }

    // Rotas
    if (url.includes('/api/trpc/bombeiros.list')) {
      const result = await makeSupabaseRequest('GET', '/rest/v1/bombeiros?select=*');
      return res.status(result.status).json(result.data);
    }

    if (url.includes('/api/trpc/bombeiros.create')) {
      const newBombeiro = {
        nome: body.nome?.toUpperCase() || '',
        equipe: body.equipe || '',
        data_inicio: body.dataInicio || new Date().toISOString()
      };
      const result = await makeSupabaseRequest('POST', '/rest/v1/bombeiros', newBombeiro);
      return res.status(result.status).json(result.data);
    }

    if (url.includes('/api/trpc/bombeiros.delete')) {
      const id = body.id;
      const result = await makeSupabaseRequest('DELETE', `/rest/v1/bombeiros?id=eq.${id}`);
      return res.status(result.status).json({ success: true });
    }

    if (url.includes('/api/trpc/escalas.list')) {
      const result = await makeSupabaseRequest('GET', '/rest/v1/escalas?select=*');
      return res.status(result.status).json(result.data);
    }

    if (url.includes('/api/trpc/escalas.create')) {
      const newEscala = {
        bombeiro_id: body.bombeiro_id,
        data: body.data,
        turno: body.turno
      };
      const result = await makeSupabaseRequest('POST', '/rest/v1/escalas', newEscala);
      return res.status(result.status).json(result.data);
    }

    // 404
    res.status(404).json({ error: 'Not Found' });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
