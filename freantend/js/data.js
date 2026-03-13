// ─── data.js  –  Agent catalog + render helpers ───────────────────────────────

const AGENTS = [
  {id:1, name:'ChatGPT',          desc:'The most widely adopted AI assistant globally. GPT-4o powers reasoning, web browsing, image gen via DALL-E 3, and code execution.',                              cat:'writing',    dev:'OpenAI',           rating:4.9, users:'200M+', price:'free', api:true,  icon:'🤖', color:'#10b981', tags:['GPT-4o','DALL-E','Code','Browse'],       nw:false},
  {id:2, name:'Claude Sonnet 4',  desc:'Anthropic flagship 2026. 200K context, MCP native support, exceptional coding and safety. Top enterprise pick of 2026.',                                       cat:'writing',    dev:'Anthropic',        rating:4.9, users:'40M+',  price:'free', api:true,  icon:'🧿', color:'#b4ff50', tags:['200K ctx','MCP','Safe','SOC2'],          nw:true },
  {id:3, name:'Gemini 2.0 Ultra', desc:"Google's 2026 flagship with 1M token context, native multimodal reasoning, and deep Google Workspace integration.",                                           cat:'research',   dev:'Google',           rating:4.8, users:'60M+',  price:'free', api:true,  icon:'💎', color:'#00f5d4', tags:['1M ctx','Multimodal','Workspace'],        nw:true },
  {id:4, name:'GitHub Copilot',   desc:"World's most deployed AI pair programmer. 30M+ devs. Autonomous PR creation and code review in 2026.",                                                        cat:'coding',     dev:'GitHub/Microsoft', rating:4.8, users:'30M+',  price:'paid', api:true,  icon:'🐙', color:'#8b5cf6', tags:['IDE','Autocomplete','PR Agent'],          nw:false},
  {id:5, name:'Midjourney v7',    desc:'State-of-the-art text-to-image. Ultra-photorealistic with consistent character generation. Upgraded in 2026.',                                                 cat:'image',      dev:'Midjourney Inc.',  rating:4.9, users:'22M+',  price:'paid', api:false, icon:'🎨', color:'#ff6b1a', tags:['Photo','v7','Characters'],                nw:true },
  {id:6, name:'Sora 2',           desc:"OpenAI's cinematic video AI. Create 60-second HD videos from text prompts with scene consistency.",                                                           cat:'video',      dev:'OpenAI',           rating:4.8, users:'4M+',   price:'paid', api:false, icon:'🎬', color:'#ff3366', tags:['60s clips','HD','Text-Video'],            nw:true },
  {id:7, name:'ElevenLabs v3',    desc:'Most realistic AI voice platform. Clone any voice, generate speech in 30+ languages. 3M+ creators.',                                                          cat:'voice',      dev:'ElevenLabs',       rating:4.8, users:'4M+',   price:'free', api:true,  icon:'🎙️',color:'#00f5d4', tags:['Voice Clone','30+ langs','API'],          nw:true },
  {id:8, name:'Perplexity Pro',   desc:'AI-powered research engine with real-time web search and auto-citations. Best research agent of 2026.',                                                        cat:'research',   dev:'Perplexity AI',    rating:4.7, users:'15M+',  price:'free', api:true,  icon:'🔍', color:'#b4ff50', tags:['Live Search','Citations','Research'],     nw:false},
  {id:9, name:'Agentforce 3.0',   desc:'Salesforce enterprise AI agent. Automates 85% of tier-1 support. Self-healing workflows. CRM-embedded.',                                                     cat:'enterprise', dev:'Salesforce',       rating:4.6, users:'3M+',   price:'paid', api:true,  icon:'🏢', color:'#00f5d4', tags:['CRM','Self-Heal','Enterprise'],           nw:true },
  {id:10,name:'Simplai',          desc:'Top no-code AI agent builder of 2026. PoC to production in 30 days. 300+ pre-built agents. SOC2 certified.',                                                  cat:'automation', dev:'Simplai',          rating:4.8, users:'2M+',   price:'free', api:true,  icon:'⚡', color:'#ff6b1a', tags:['No-code','300+ agents','SOC2'],           nw:true },
  {id:11,name:'Devin 2.0',        desc:'Fully autonomous software engineer. Handles full-stack development from a single natural language prompt.',                                                    cat:'coding',     dev:'Cognition AI',     rating:4.7, users:'800K+', price:'paid', api:true,  icon:'💻', color:'#8b5cf6', tags:['Autonomous','Full-stack','SWE'],          nw:true },
  {id:12,name:'Beam AI',          desc:"2026's self-optimizing enterprise agent. Learns from every interaction, solves the 'maintenance trap'.",                                                       cat:'enterprise', dev:'Beam AI',          rating:4.7, users:'1M+',   price:'paid', api:true,  icon:'🚀', color:'#b4ff50', tags:['Self-Learn','Healing','Enterprise'],      nw:true },
  {id:13,name:'Julius AI',        desc:'AI data analyst that reads CSVs and databases. Ask questions in plain English, get instant charts.',                                                           cat:'data',       dev:'Julius',           rating:4.5, users:'700K+', price:'free', api:true,  icon:'📊', color:'#00f5d4', tags:['CSV','Charts','SQL-free'],                nw:false},
  {id:14,name:'CrewAI',           desc:'Open-source multi-agent orchestration framework. Build teams of AI agents with role-based specialization.',                                                    cat:'automation', dev:'CrewAI Inc.',      rating:4.6, users:'3M+',   price:'free', api:true,  icon:'👥', color:'#ff3366', tags:['Multi-agent','Open Source','Python'],     nw:false},
  {id:15,name:'Gumloop',          desc:'"Zapier + ChatGPT" — no-code AI agent builder for marketing automation with visual canvas editor.',                                                           cat:'automation', dev:'Gumloop',          rating:4.7, users:'500K+', price:'free', api:true,  icon:'🔄', color:'#8b5cf6', tags:['No-code','Marketing','Canvas'],           nw:true },
  {id:16,name:'Kore.ai XO',       desc:'Enterprise agent platform with 300+ pre-built agents. SOC2, ISO27001, on-prem deployment options.',                                                           cat:'enterprise', dev:'Kore.ai',          rating:4.7, users:'2M+',   price:'paid', api:true,  icon:'🔐', color:'#ff6b1a', tags:['Enterprise','300+ agents','On-prem'],     nw:false},
  {id:17,name:'LangGraph',        desc:'Stateful, controllable agent framework within LangChain ecosystem. Gold standard for developer-led building.',                                                 cat:'coding',     dev:'LangChain',        rating:4.6, users:'5M+',   price:'free', api:true,  icon:'🔗', color:'#b4ff50', tags:['Open Source','Streaming','Python'],       nw:false},
  {id:18,name:'SentinelAI',       desc:'AI cybersecurity agent. Monitors networks 24/7, isolates threats in real-time. Fortune 500 trusted.',                                                         cat:'security',   dev:'CrowdStrike AI',   rating:4.8, users:'1.5M+', price:'paid', api:true,  icon:'🛡️',color:'#ff3366', tags:['24/7 Monitor','Zero-day','F500'],          nw:true },
];

// Build a text catalog for Claude prompts
const AGENT_CATALOG = AGENTS.map(a =>
  `ID:${a.id} | ${a.name} (${a.dev}) | cat:${a.cat} | tags:${a.tags.join(',')} | ${a.desc}`
).join('\n');

// ── State ─────────────────────────────────────────────────────────────────────
let aC = 'all', sQ = '';

// ── Agent cards ───────────────────────────────────────────────────────────────
function renderCards() {
  const g = document.getElementById('agGrid');
  let l = AGENTS;
  if (aC !== 'all') l = l.filter(a => a.cat === aC);
  if (sQ) l = l.filter(a =>
    a.name.toLowerCase().includes(sQ) ||
    a.desc.toLowerCase().includes(sQ) ||
    a.tags.join(' ').toLowerCase().includes(sQ)
  );
  g.innerHTML = l.map((a, i) => `
    <div class="ac" onclick="openAg(${a.id})" style="animation-delay:${i*0.03}s">
      ${a.nw ? '<div style="position:absolute;top:14px;right:14px;font-size:9px;font-weight:800;color:#050508;background:var(--acid);padding:2px 7px;border-radius:3px;letter-spacing:1px">NEW 2026</div>' : ''}
      <div class="act">
        <div class="ai" style="background:${a.color}15;border-color:${a.color}30">${a.icon}</div>
        <div>
          <div class="an">${a.name}</div>
          <div class="adev">by <span>${a.dev}</span>${a.api ? ' · <span style="color:var(--acid);font-size:10px;font-weight:800">API</span>' : ''}</div>
        </div>
      </div>
      <p class="adesc">${a.desc}</p>
      <div class="atags">${a.tags.map(t => `<span class="atag">${t}</span>`).join('')}</div>
      <div class="afoot">
        <div class="astats">
          <div class="astat">⭐ <b>${a.rating}</b></div>
          <div class="astat">👥 <b>${a.users}</b></div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="fb ${a.price}">${a.price === 'free' ? 'FREE' : 'PAID'}</span>
          <button class="tb" onclick="event.stopPropagation();tryIt('${a.name}')">Try →</button>
        </div>
      </div>
    </div>`).join('');
}

function setCat(c, el) {
  aC = c;
  document.querySelectorAll('.cat').forEach(x => x.classList.remove('on'));
  el.classList.add('on');
  renderCards();
}

function filterCards(q) { sQ = q.toLowerCase(); renderCards(); }

// ── Trending ──────────────────────────────────────────────────────────────────
function renderTrending() {
  const T = [
    {e:'🤖',n:'ChatGPT',   c:'Writing AI', r:1, ch:'+12%'},
    {e:'🧿',n:'Claude 4',  c:'Writing AI', r:2, ch:'+28%'},
    {e:'💎',n:'Gemini 2',  c:'Research',   r:3, ch:'+19%'},
    {e:'⚡',n:'Simplai',   c:'Automation', r:4, ch:'+45%'},
    {e:'🎨',n:'Midjourney',c:'Image AI',   r:5, ch:'+8%' },
    {e:'💻',n:'Devin 2.0', c:'Coding AI',  r:6, ch:'+67%'},
    {e:'🏢',n:'Agentforce',c:'Enterprise', r:7, ch:'+33%'},
    {e:'🔍',n:'Perplexity',c:'Research',   r:8, ch:'+22%'},
    {e:'👥',n:'CrewAI',    c:'Automation', r:9, ch:'+15%'},
    {e:'🚀',n:'Beam AI',   c:'Enterprise', r:10,ch:'+55%'},
  ];
  document.getElementById('tGrid').innerHTML = T.map(t =>
    `<div class="tc" onclick="toast('Opening ${t.n}...')">
      <div class="tc-rank">#${t.r}</div>
      <span class="tc-em">${t.e}</span>
      <div class="tc-nm">${t.n}</div>
      <div class="tc-cat">${t.c}</div>
      <div class="tc-ch">↑ ${t.ch} this week</div>
    </div>`
  ).join('');
}

// ── News ──────────────────────────────────────────────────────────────────────
function renderNews() {
  const N = [
    {cat:'Market Data', cc:'var(--acid)',  title:'AI agent market hits $10.9B in 2026 — 49.6% annual growth sustained',                                              meta:'Gartner Research · March 2026',      badge:'REPORT',     bc:'rgba(180,255,80,0.1)', bt:'var(--acid)'},
    {cat:'Platform',    cc:'var(--cyan)',  title:'Simplai named top no-code AI agent builder 2026 across 7 platforms independently tested',                           meta:'Medium · Feb 2026',                  badge:'REVIEW',     bc:'rgba(0,245,212,0.1)',  bt:'var(--cyan)'},
    {cat:'Enterprise',  cc:'var(--plasma)',title:'Kore.ai Agent Marketplace reaches 300+ pre-built enterprise agents — deploy 10x faster',                            meta:'Kore.ai Blog · March 2026',          badge:'ENTERPRISE', bc:'rgba(255,107,26,0.1)',bt:'var(--plasma)'},
    {cat:'Statistics',  cc:'var(--violet)',title:'McKinsey: 62% of organizations working with AI agents, 23% already scaling agentic systems in production',          meta:'McKinsey State of AI · 2026',        badge:'STATS',      bc:'rgba(139,92,246,0.1)',bt:'var(--violet)'},
    {cat:'Developer',   cc:'var(--acid)',  title:'LangGraph becomes the 2026 gold standard for developer-led agent building with stateful streaming',                  meta:'DataCamp AI Report · 2026',          badge:'DEV',        bc:'rgba(180,255,80,0.1)', bt:'var(--acid)'},
    {cat:'Investment',  cc:'var(--plasma)',title:'$211B in AI VC funding in 2025 — half of ALL global venture capital. 2026 on pace to surpass it.',                  meta:'Jon Radoff — State of Agents · 2026',badge:'VC',         bc:'rgba(255,107,26,0.1)',bt:'var(--plasma)'},
  ];
  document.getElementById('nGrid').innerHTML = N.map(n =>
    `<div class="nc" onclick="toast('Opening article...')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div class="nc-cat" style="color:${n.cc}">${n.cat}</div>
        <span class="nc-badge" style="background:${n.bc};color:${n.bt}">${n.badge}</span>
      </div>
      <div class="nc-title">${n.title}</div>
      <div class="nc-meta">${n.meta}</div>
    </div>`
  ).join('');
}
