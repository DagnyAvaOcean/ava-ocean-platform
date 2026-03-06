export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin || '';
  const allowed = [
    'https://ava-ocean-platform.vercel.app',
    'http://localhost:3000'
  ];
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
    res.setHeader('Access-Control-Allow-Origin', origin);
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
