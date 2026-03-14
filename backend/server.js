const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.ANTHROPIC_API_KEY });
});

async function callAI(system, messages, max_tokens) {
  const allMessages = [
    { role: 'user', content: `${system}\n\n${messages[0].content}` },
    ...messages.slice(1)
  ];
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      'HTTP-Referer'  : 'https://satish8988.github.io',
      'X-Title'       : 'AI Galaxy',
    },
    body: JSON.stringify({
      model   : 'google/gemma-3n-e4b-it:free',
      messages: allMessages,
      max_tokens,
    }),
  });
  const data = await r.json();
  console.log('AI response:', JSON.stringify(data).slice(0, 400));
  return data.choices?.[0]?.message?.content || '';
}

app.post('/api/claude/chat', async (req, res) => {
  const { system, messages, max_tokens = 1000 } = req.body;
  try {
    const text = await callAI(system, messages, max_tokens);
    res.json({ text });
  } catch (err) {
    console.error(err);
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
    const text = await callAI(system, messages, max_tokens);
    const words = text.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ type:'content_block_delta', delta:{ type:'text_delta', text: word + ' ' }})}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () =>
  console.log(`✅  AI Galaxy backend  →  http://localhost:${PORT}`)
);
