// ─── api.js  –  All Claude calls go through YOUR backend (never direct) ───────

const API_BASE = 'http://localhost:3001'; // ← change if you deploy backend elsewhere

// ── Shared markdown renderer ──────────────────────────────────────────────────
function renderMd(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong style="color:var(--text)">$1</strong>')
    .replace(/`([^`]+)`/g,'<code style="background:rgba(180,255,80,0.08);color:var(--acid);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/\n/g,'<br>');
}

// ── Non-streaming POST ────────────────────────────────────────────────────────
async function apiChat(system, userMsg, maxTokens = 1000) {
  const r = await fetch(`${API_BASE}/api/claude/chat`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ system, messages: [{ role:'user', content: userMsg }], max_tokens: maxTokens }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Backend error');
  return data.text || '';
}

// ── Streaming POST ────────────────────────────────────────────────────────────
async function apiStream(system, userMsg, onChunk, maxTokens = 1200) {
  const r = await fetch(`${API_BASE}/api/claude/stream`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ system, messages: [{ role:'user', content: userMsg }], max_tokens: maxTokens }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error || r.statusText); }

  const reader  = r.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;
      try {
        const evt = JSON.parse(raw);
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta')
          onChunk(evt.delta.text);
      } catch (_) {}
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SEARCH
// ─────────────────────────────────────────────────────────────────────────────
function fQ(t) { document.getElementById('heroQ').value = t; runWF(); }

async function runWF() {
  const q = document.getElementById('heroQ').value.trim();
  if (!q) return;

  const wfRes   = document.getElementById('wfRes');
  const loading = document.getElementById('wfLoading');
  const content = document.getElementById('wfContent');
  wfRes.classList.add('show');
  loading.style.display = 'block';
  content.style.display = 'none';

  const system = `You are the AI Galaxy search engine. The user describes a goal.
Recommend 3-5 agents from this catalog and explain in 2-3 sentences how they work together.

CATALOG:
${AGENT_CATALOG}

Reply ONLY in this exact JSON (no markdown fences):
{"agents":[{"id":1,"name":"Name","reason":"one line why"}],"summary":"2-3 sentence explanation"}`;

  try {
    const raw    = await apiChat(system, q, 1000);
    const result = JSON.parse(raw.replace(/```json|```/g,'').trim());

    loading.style.display = 'none';
    content.style.display = 'block';

    document.getElementById('wfChain').innerHTML = result.agents.map((a, i) =>
      (i > 0 ? '<div class="wfarrow">→</div>' : '') +
      `<div class="wfnode">${AGENTS.find(x => x.id === a.id)?.icon || '🤖'} ${a.name}</div>`
    ).join('');

    document.getElementById('wfAIAnswer').innerHTML = renderMd(result.summary);

    document.getElementById('wfAgentCards').innerHTML = result.agents.map(a => {
      const ag = AGENTS.find(x => x.id === a.id);
      if (!ag) return '';
      return `<div style="flex:1;min-width:160px;background:rgba(180,255,80,0.04);border:1px solid rgba(180,255,80,0.15);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="openAg(${ag.id})">
        <div style="font-size:18px;margin-bottom:5px">${ag.icon}</div>
        <div style="font-size:12px;font-weight:800;margin-bottom:3px">${ag.name}</div>
        <div style="font-size:11px;color:var(--muted)">${a.reason}</div>
      </div>`;
    }).join('');
  } catch (err) {
    loading.style.display = 'none';
    content.style.display = 'block';
    document.getElementById('wfAIAnswer').textContent = `❌ ${err.message}`;
    document.getElementById('wfChain').innerHTML = '';
    document.getElementById('wfAgentCards').innerHTML = '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETPLACE AI SEARCH
// ─────────────────────────────────────────────────────────────────────────────
async function runMkSearch() {
  const q      = document.getElementById('mkS').value.trim();
  if (!q) return;
  const panel   = document.getElementById('mkAIPanel');
  const loading = document.getElementById('mkAILoading');
  const result  = document.getElementById('mkAIResult');
  panel.style.display   = 'block';
  loading.style.display = 'block';
  result.innerHTML      = '';

  try {
    const text = await apiChat(
      `You are the AI Galaxy marketplace search. Recommend agents for the query. Use the catalog below.
Reply in 2-3 short paragraphs with **bold** agent names.
CATALOG:\n${AGENT_CATALOG}`,
      q, 800
    );
    loading.style.display = 'none';
    result.innerHTML = renderMd(text);
  } catch (err) {
    loading.style.display = 'none';
    result.innerHTML = `<span style="color:var(--red)">❌ ${err.message}</span>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYGROUND
// ─────────────────────────────────────────────────────────────────────────────
let pgT = 'writing';

const AGENT_CONFIGS = {
  writing:    { label:'✍️ WRITING AI — LIVE OUTPUT',    badge:'Writing AI',    desc:'Crafts posts, articles, essays and creative content for any topic.',           color:'#b4ff50', system:'You are a Writing AI agent. Produce high-quality, well-structured written content. Match the tone to the request — professional, creative, academic, or casual. Use **bold** headers where helpful.' },
  essay:      { label:'📝 ESSAY WRITER — LIVE OUTPUT',  badge:'Essay Writer',  desc:'Writes academic and creative essays with structure and depth.',                 color:'#b4ff50', system:'You are an Essay Writing AI. Write well-structured essays: clear thesis, supporting arguments, conclusion. Use **bold** section headers. Be thorough and academically rigorous.' },
  coding:     { label:'💻 CODING AI — LIVE OUTPUT',     badge:'Coding AI',     desc:'Writes, debugs, and explains code across all languages.',                       color:'#00f5d4', system:'You are a Coding AI. Write clean, efficient, well-commented code. Explain your reasoning. Use code blocks. Handle debugging, architecture, and reviews.' },
  research:   { label:'🔬 RESEARCH AI — LIVE OUTPUT',   badge:'Research AI',   desc:'Deep research, source synthesis, and detailed reports.',                        color:'#8b5cf6', system:'You are a Research AI. Write comprehensive, well-structured reports with **bold** section headers. Include background, findings, analysis, and conclusions. Be thorough.' },
  education:  { label:'🎓 EDUCATION AI — LIVE OUTPUT',  badge:'Education AI',  desc:'Explains complex topics clearly for any age or level.',                         color:'#b4ff50', system:'You are an Education AI. Break complex topics into clear, engaging explanations. Use analogies, examples, and step-by-step breakdowns. Adapt to the user\'s knowledge level.' },
  healthcare: { label:'🏥 HEALTHCARE AI — LIVE OUTPUT', badge:'Healthcare AI', desc:'Medical information, research summaries, and health guidance.',                  color:'#ff3366', system:'You are a Healthcare AI. Provide accurate medical information and research summaries. Always recommend consulting a healthcare professional for personal decisions. Use **bold** headers.' },
  finance:    { label:'💹 FINANCE AI — LIVE OUTPUT',    badge:'Finance AI',    desc:'Financial analysis, investment strategies, economic trends.',                   color:'#00f5d4', system:'You are a Finance AI. Provide comprehensive financial analysis: market overview, key metrics, risk factors, strategic recommendations. Note: informational only, not personalized advice.' },
  legal:      { label:'⚖️ LEGAL AI — LIVE OUTPUT',     badge:'Legal AI',      desc:'Legal concepts, document drafting, regulatory frameworks.',                     color:'#8b5cf6', system:'You are a Legal AI. Explain legal concepts, relevant laws, and practical implications. Use **bold** headers. Always note users should consult a qualified attorney.' },
  marketing:  { label:'📢 MARKETING AI — LIVE OUTPUT',  badge:'Marketing AI',  desc:'Campaigns, copy, strategies and brand content.',                                color:'#ff6b1a', system:'You are a Marketing AI. Produce compelling marketing content: campaigns, audience analysis, messaging, channel strategy, KPIs, creative copy. Be specific and actionable. Use **bold** headers.' },
  automation: { label:'🤖 AUTOMATION AI — LIVE OUTPUT', badge:'Automation AI', desc:'Multi-agent pipelines, workflow automations, process optimizations.',           color:'#ff6b1a', system:'You are an Automation AI. Design detailed pipelines with process mapping, agent roles, tool recommendations, integration points, and ROI metrics. Use step-by-step diagrams with arrows (→).' },
  data:       { label:'📊 DATA ANALYST — LIVE OUTPUT',  badge:'Data Analyst',  desc:'Data analysis, trend interpretation, reports and key insights.',                color:'#ff3366', system:'You are a Data Analyst AI. Produce thorough analysis: methodology, key findings, statistical insights, anomaly detection, visualisation recommendations, and actionable conclusions. Use **bold** headers.' },
  security:   { label:'🔐 SECURITY AI — LIVE OUTPUT',   badge:'Security AI',   desc:'Cybersecurity threats, vulnerabilities, compliance, defense strategies.',       color:'#ff3366', system:'You are a Cybersecurity AI. Provide comprehensive security analysis: threat landscape, vulnerability assessment, attack vectors, defensive measures, compliance, incident response. Use **bold** headers. Be technically precise.' },
};

function pickAg(el, t) {
  pgT = t;
  document.querySelectorAll('.abtn').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  const cfg = AGENT_CONFIGS[t];
  if (!cfg) return;
  document.getElementById('pgAgentLabel').textContent   = cfg.label;
  document.getElementById('pgAgentBadge').innerHTML     = `<span style="color:${cfg.color};font-weight:800">${cfg.badge}</span><br>${cfg.desc}`;
  document.getElementById('pgOut').textContent          = 'Your real AI-generated result streams here. Every response is unique — powered by Claude API.';
  document.getElementById('pgOut').style.color          = 'var(--muted)';
  document.getElementById('pgTokens').textContent       = '';
}

async function runPG() {
  const inp     = document.getElementById('pgIn').value.trim();
  if (!inp) { toast('⚠️ Enter a prompt first'); return; }
  const cfg     = AGENT_CONFIGS[pgT] || AGENT_CONFIGS.writing;
  const out     = document.getElementById('pgOut');
  const btn     = document.getElementById('pgRunBtn');
  const tokenEl = document.getElementById('pgTokens');

  btn.disabled     = true;
  btn.textContent  = '⏳ Generating...';
  out.innerHTML    = '<span class="cur"></span>';
  out.style.color  = 'var(--text)';
  tokenEl.textContent = '';

  let fullText = '', tokenCount = 0;
  try {
    await apiStream(cfg.system, inp, chunk => {
      fullText   += chunk;
      tokenCount++;
      out.innerHTML       = renderMd(fullText) + '<span class="cur"></span>';
      tokenEl.textContent = `${tokenCount * 4 | 0} tokens`;
      out.scrollTop       = out.scrollHeight;
    });
    out.innerHTML       = renderMd(fullText);
    tokenEl.textContent = `~${Math.round(fullText.length / 4)} tokens · ✓ Complete`;
    tokenEl.style.color = 'var(--acid)';
  } catch (err) {
    out.textContent   = `❌ Error: ${err.message}`;
    out.style.color   = 'var(--red)';
  } finally {
    btn.disabled    = false;
    btn.textContent = '⚡ Run Real AI Agent';
  }
}
