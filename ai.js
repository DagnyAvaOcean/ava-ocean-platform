// Vercel Serverless Function — /api/ai
// Proxies requests to Anthropic API so the key never touches the browser

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic origin check — only allow requests from your own domain
  const origin = req.headers.origin || '';
  const allowed = [
    'https://ava-ocean-platform.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1'
  ];
  // Allow all vercel preview deployments too
  if (!allowed.includes(origin) && !origin.endsWith('.vercel.app')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { model, max_tokens, messages, system } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1000,
        messages,
        ...(system && { system })
      })
    });

    const data = await response.json();
    
    // Set CORS header
    res.setHeader('Access-Control-Allow-Origin', origin);
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
