// ─── ui.js  –  Cursor, modal, workflow builder, toast, nav ───────────────────

// ── Custom cursor ─────────────────────────────────────────────────────────────
const cd = document.getElementById('cd');
const cr = document.getElementById('cr');
document.addEventListener('mousemove', e => {
  cd.style.cssText += `;left:${e.clientX-3}px;top:${e.clientY-3}px`;
  cr.style.cssText += `;left:${e.clientX-15}px;top:${e.clientY-15}px`;
});
document.querySelectorAll(
  'button,[class*="btn"],[class*="cat"],[class*="hint"],.ac,.tc,.nav-a,.wbt,.abtn,.nc'
).forEach(el => {
  el.addEventListener('mouseenter', () => cr.style.transform = 'scale(1.8)');
  el.addEventListener('mouseleave', () => cr.style.transform = 'scale(1)');
});

// ── Ticker ────────────────────────────────────────────────────────────────────
const TN = [
  '🔥 Gartner: 40% of enterprise apps will embed AI agents by EOY 2026',
  '📈 AI agent market hits $10.9B — growing 49.6% annually',
  '⚡ Anthropic MCP becomes the standard for AI agent interoperability',
  '🤖 62% of organizations now actively deploying AI agents — McKinsey 2026',
  '🚀 Simplai tops 2026 AI agent platform rankings',
  '💡 Kore.ai Agent Marketplace reaches 300+ pre-built enterprise agents',
  '📊 EY deploys 150 AI tax agents — reduces compliance costs by 25%',
  '🌐 $211B in AI VC funding in 2025 — half of all global venture capital',
];
const tEl = document.getElementById('tickerEl');
const tS  = TN.map(n => `<span class="ticker-item">${n}</span>`).join('');
tEl.innerHTML = tS + tS; // doubled for seamless loop

// ── Agent modal ───────────────────────────────────────────────────────────────
function openAg(id) {
  const a = AGENTS.find(x => x.id === id);
  if (!a) return;
  document.getElementById('agModC').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <div style="width:54px;height:54px;border-radius:12px;background:${a.color}15;border:1px solid ${a.color}30;display:flex;align-items:center;justify-content:center;font-size:26px">${a.icon}</div>
      <div>
        <div style="font-size:20px;font-weight:800;letter-spacing:-0.5px;margin-bottom:3px">
          ${a.name}${a.nw ? ' <span style="font-size:9px;background:var(--acid);color:#050508;padding:2px 7px;border-radius:3px;font-weight:800;letter-spacing:1px">NEW 2026</span>' : ''}
        </div>
        <div style="font-size:12px;color:var(--muted)">by <span style="color:var(--cyan)">${a.dev}</span> · ⭐ ${a.rating} · 👥 ${a.users}</div>
      </div>
    </div>
    <p style="font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:16px">${a.desc}</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px">
      ${a.tags.map(t => `<span style="font-size:10px;padding:3px 10px;border-radius:3px;background:rgba(255,255,255,0.05);color:var(--muted);font-weight:700;letter-spacing:0.5px;text-transform:uppercase">${t}</span>`).join('')}
      <span class="fb ${a.price}">${a.price === 'free' ? 'FREE' : 'PAID'}</span>
      ${a.api ? '<span style="font-size:10px;padding:3px 10px;border-radius:3px;background:rgba(0,245,212,0.1);color:var(--cyan);font-weight:800;letter-spacing:1px">API</span>' : ''}
    </div>
    <div style="background:var(--bg2);border-radius:10px;padding:16px;margin-bottom:20px;font-size:13px;line-height:2;color:var(--muted)">
      <div>✦ AI Galaxy Workflow Builder integrated</div>
      <div>✦ Testable in AI Galaxy Playground</div>
      <div>✦ MCP protocol support verified</div>
      <div>✦ Live usage stats updated daily</div>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-acid" style="flex:1" onclick="tryIt('${a.name}')">⚡ Test in Playground</button>
      <button class="btn btn-ghost" style="flex:1" onclick="toast('Opening ${a.name}...')">Open Agent →</button>
    </div>`;
  document.getElementById('agMod').classList.add('open');
}

function closeM() { document.getElementById('agMod').classList.remove('open'); }
document.getElementById('agMod').addEventListener('click', function(e) { if (e.target === this) closeM(); });

function tryIt(n) {
  closeM();
  document.querySelector('#playground').scrollIntoView({ behavior: 'smooth' });
  toast(`⚡ ${n} loaded in Playground`);
}

// ── Workflow builder ──────────────────────────────────────────────────────────
let wbL = [];

function addN(nm, col) { wbL.push({ nm, col }); renderWB(); }

function removeN(i) { wbL.splice(i, 1); renderWB(); }

function renderWB() {
  const c = document.getElementById('wbC');
  const s = document.getElementById('wbSt');
  if (!wbL.length) {
    c.innerHTML   = '<div class="wbe">Click agent types above to build your AI workflow pipeline</div>';
    s.textContent = '';
    return;
  }
  c.innerHTML = wbL.map((n, i) =>
    `${i > 0 ? '<div class="wbar">→</div>' : ''}
    <div class="wbn" style="border-color:${n.col}40;background:${n.col}12;color:${n.col}">
      ${n.nm}<div class="wbd" onclick="removeN(${i})">✕</div>
    </div>`
  ).join('');
  s.textContent  = `${wbL.length} agent${wbL.length > 1 ? 's' : ''} in pipeline`;
  s.style.color  = 'var(--muted)';
}

function clearWB() { wbL = []; renderWB(); }

function runWB() {
  if (!wbL.length) { toast('⚠️ Add agents first'); return; }
  const s = document.getElementById('wbSt');
  s.textContent = '⚡ Executing...';
  s.style.color = 'var(--acid)';
  setTimeout(() => { s.textContent = `✓ ${wbL.length}-agent pipeline completed`; }, 2000);
  toast(`⚡ Running ${wbL.length}-agent pipeline...`);
}

function saveWB() {
  if (!wbL.length) { toast('⚠️ Add agents first'); return; }
  toast('💾 Workflow saved to AI Galaxy account!');
}

function loadTpl() {
  wbL = [
    {nm:'📝 Script Writer', col:'#b4ff50'},
    {nm:'🎙️ Voice AI',      col:'#00f5d4'},
    {nm:'🎬 Video Creator', col:'#ff3366'},
    {nm:'🖼️ Thumbnail AI',  col:'#ff6b1a'},
    {nm:'📱 Social AI',     col:'#8b5cf6'},
  ];
  renderWB();
  const s = document.getElementById('wbSt');
  s.textContent = 'Loaded: YouTube Creator Pipeline';
  s.style.color = 'var(--acid)';
}

// ── Developer form ────────────────────────────────────────────────────────────
function submitDev() {
  const n = document.querySelector('.fi').value;
  if (!n.trim()) { toast('⚠️ Enter agent name'); return; }
  toast('🚀 Agent submitted! Review within 24 hours.');
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(m) {
  const t = document.getElementById('tst');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Smooth scroll nav ─────────────────────────────────────────────────────────
function goTo(s) { document.querySelector(s)?.scrollIntoView({ behavior: 'smooth' }); }

// ── Init ──────────────────────────────────────────────────────────────────────
renderCards();
renderTrending();
renderNews();
