const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'https://satish8988.github.io' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/claude/chat', async (req, res) => {
  const { system, messages, max_tokens = 1000 } = req.body;
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model   : 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role:'system', content: system }, ...messages],
        max_tokens,
      }),
    });
    const data = await r.json();
    res.json({ text: data.choices?.[0]?.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/claude/stream', async (req, res) => {
  const { system, messages, max_tokens = 1200 } = req.body;

  res.setHeader('Content-Type' , 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection'   , 'keep-alive');
  res.flushHeaders();

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model   : 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role:'system', content: system }, ...messages],
        max_tokens,
        stream  : true,
      }),
    });

    const reader  = r.body;
    const decoder = new (require('string_decoder').StringDecoder)('utf8');
    reader.on('data', chunk => {
      const lines = decoder.write(chunk).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') { res.write('data: [DONE]\n\n'); return; }
        try {
          const evt  = JSON.parse(raw);
          const text = evt.choices?.[0]?.delta?.content;
          if (text) res.write(`data: ${JSON.stringify({ type:'content_block_delta', delta:{ type:'text_delta', text }})}\n\n`);
        } catch (_) {}
      }
    });
    reader.on('end',   () => res.end());
    reader.on('error', () => res.end());
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () =>
  console.log(`✅  AI Galaxy backend  →  http://localhost:${PORT}`)
);
