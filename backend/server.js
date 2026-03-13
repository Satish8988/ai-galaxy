const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'https://satish8988.github.io' }));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Non-streaming call  (hero search + marketplace AI search) ─────────────────
app.post('/api/claude/chat', async (req, res) => {
  const { system, messages, max_tokens = 1000 } = req.body;
  if (!process.env.ANTHROPIC_API_KEY)
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method : 'POST',
      headers: {
        'Content-Type'     : 'application/json',
        'x-api-key'        : process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens, system, messages,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || 'API error' });
    res.json({ text: data.content?.[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Streaming call  (Playground live output) ──────────────────────────────────
app.post('/api/claude/stream', async (req, res) => {
  const { system, messages, max_tokens = 1200 } = req.body;
  if (!process.env.ANTHROPIC_API_KEY)
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' });

  res.setHeader('Content-Type' , 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection'   , 'keep-alive');
  res.flushHeaders();

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method : 'POST',
      headers: {
        'Content-Type'     : 'application/json',
        'x-api-key'        : process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens, system, messages, stream: true,
      }),
    });

    if (!r.ok) {
      const err = await r.json();
      res.write(`data: ${JSON.stringify({ error: err.error?.message })}\n\n`);
      return res.end();
    }

    r.body.on('data' , chunk => res.write(chunk));
    r.body.on('end'  , ()    => res.end());
    r.body.on('error', ()    => res.end());
    req.on('close'   , ()    => r.body.destroy());
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () =>
  console.log(`✅  AI Galaxy backend  →  http://localhost:${PORT}`)
);
