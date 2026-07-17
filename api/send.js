// api/send.js — Proxy Serverless para evitar bloqueos de CORS del navegador al llamar a n8n
export default async function handler(req, res) {
  // Manejar CORS headers si se requiere
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const n8nWebhookUrl = 'https://mdter.app.n8n.cloud/webhook/enviar-humano';
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.text();
    return res.status(response.status).send(data);
  } catch (err) {
    console.error('Error enviando mensaje via Vercel Proxy:', err);
    return res.status(500).json({ error: err.message });
  }
}
