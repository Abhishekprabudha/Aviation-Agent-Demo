const TOTAL_DURATION = 180;
const VIDEO_DURATION_SECONDS = 180;
const VIDEO_PLAYBACK_RATE = 1;
const AUDIO_PATH = 'assets/audio/aviation-ai-agents-narration.mp3';
const ALL_AGENTS = [
  'Predictive Aircraft Maintenance',
  'Revenue Leakage Control & Yield AI',
  'AI-Native Passenger CX & Contact Centre',
  'Fuel Optimisation & Carbon Intelligence',
  'Crew Scheduling & Operations AI',
  'AI On-Demand Scheduling & Trip Intelligence',
  'Condition-Based Maintenance',
  'VIP Passenger Personalisation AI',
  'Ground Ops Turnaround Intelligence',
  'AI Flight Planning & Route Optimisation'
];

let scenes = [];
let isPlaying = false;
let startTs = null;
let pauseAt = 0;
let raf = null;
let lastSceneId = null;
let narrationOn = true;
let audio = new Audio(AUDIO_PATH);
audio.preload = 'auto';

const el = {
  video: document.getElementById('bgVideo'),
  chapter: document.getElementById('chapter'),
  headline: document.getElementById('headline'),
  narrative: document.getElementById('narrative'),
  activeAgent: document.getElementById('activeAgent'),
  agentGrid: document.getElementById('agentGrid'),
  equation: document.getElementById('equation'),
  agentLog: document.getElementById('agentLog'),
  analyticsTitle: document.getElementById('analyticsTitle'),
  chartType: document.getElementById('chartType'),
  chartALabel: document.getElementById('chartALabel'),
  chartBLabel: document.getElementById('chartBLabel'),
  chartA: document.getElementById('chartA'),
  chartB: document.getElementById('chartB'),
  kpiStrip: document.getElementById('kpiStrip'),
  playBtn: document.getElementById('playBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  resetBtn: document.getElementById('resetBtn'),
  progress: document.getElementById('progress'),
  clock: document.getElementById('clock'),
  heroMetric: document.getElementById('heroMetric')
};

function fmt(t) {
  const m = Math.floor(t / 60).toString().padStart(2, '0');
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function currentScene(t) {
  return scenes.find(s => t >= s.start && t < s.end) || scenes[scenes.length - 1];
}

function setAgentGrid(active) {
  el.agentGrid.innerHTML = ALL_AGENTS.map(a => `
    <div class="agent-chip ${a === active ? 'active' : ''}">
      <span class="agent-dot"></span><span>${a}</span>
    </div>`).join('');
}

function drawChart(canvas, t, seed, mode) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let y = 30; y < h; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const vals = Array.from({ length: 18 }, (_, i) => {
    const wave = Math.sin((i + t * 0.18 + seed) * 0.72) * 0.21 + Math.cos((i + seed) * 0.41) * 0.09;
    return Math.max(0.08, Math.min(0.94, 0.52 + wave + (seed % 3) * 0.05));
  });

  const drawBars = (stacked = false, horizontal = false) => {
    vals.slice(0, 12).forEach((v, i) => {
      const bw = horizontal ? (w - 40) * v : w / 15;
      const bh = horizontal ? h / 16 : v * (h - 28);
      const x = horizontal ? 18 : 18 + i * (w / 15 + 7);
      const y = horizontal ? 10 + i * (h / 15) : h - bh - 8;
      const grad = ctx.createLinearGradient(0, y, horizontal ? x + bw : x, horizontal ? y : h);
      grad.addColorStop(0, 'rgba(86,213,255,.88)');
      grad.addColorStop(1, 'rgba(118,255,181,.45)');
      ctx.fillStyle = grad;
      if (stacked && !horizontal) {
        const half = bh * 0.6;
        ctx.fillRect(x, h - half - 8, bw, half);
        ctx.fillStyle = 'rgba(118,255,181,.35)';
        ctx.fillRect(x, h - bh - 8, bw, bh - half);
      } else {
        ctx.fillRect(x, y, bw, bh);
      }
    });
  };

  if (/PIE|DOUGHNUT/.test(mode)) {
    const cx = w / 2, cy = h / 2 + 5, r = Math.min(w, h) * 0.34;
    let start = -Math.PI / 2;
    vals.slice(0, 5).forEach((v, i) => {
      const slice = (v / vals.slice(0, 5).reduce((a, b) => a + b, 0)) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = `hsla(${180 + i * 25}, 95%, 65%, .85)`;
      ctx.fill();
      start += slice;
    });
    if (/DOUGHNUT/.test(mode)) {
      ctx.fillStyle = 'rgba(4,10,22,0.95)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (/RADAR/.test(mode)) {
    const cx = w / 2, cy = h / 2 + 6, r = Math.min(w, h) * 0.38;
    ctx.strokeStyle = 'rgba(86,213,255,.32)';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = (-Math.PI / 2) + i * Math.PI / 3; const x = cx + Math.cos(a) * r; const y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = 'rgba(86,213,255,.2)'; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = (-Math.PI / 2) + i * Math.PI / 3; const rr = r * (0.48 + vals[i] * 0.42); const x = cx + Math.cos(a) * rr; const y = cy + Math.sin(a) * rr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(118,255,181,.92)'; ctx.stroke();
  } else if (/SCATTER|BUBBLE/.test(mode)) {
    vals.slice(0, 14).forEach((v, i) => {
      const x = 16 + (i / 13) * (w - 32);
      const y = h - (v * (h - 26)) - 8;
      const rr = /BUBBLE/.test(mode) ? 4 + ((vals[i + 1] || 0.5) * 10) : 4;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(86,213,255,.65)';
      ctx.fill();
    });
  } else if (/FUNNEL/.test(mode)) {
    const levels = vals.slice(0, 6);
    levels.forEach((v, i) => {
      const topW = (w - 40) * (0.95 - i * 0.12);
      const botW = (w - 40) * (0.83 - i * 0.12);
      const y = 12 + i * ((h - 24) / 6);
      const hh = (h - 24) / 6 - 4;
      ctx.beginPath();
      ctx.moveTo((w - topW) / 2, y);
      ctx.lineTo((w + topW) / 2, y);
      ctx.lineTo((w + botW) / 2, y + hh);
      ctx.lineTo((w - botW) / 2, y + hh);
      ctx.closePath();
      ctx.fillStyle = `hsla(${170 + i * 8}, 90%, ${55 - i * 3}%, .82)`;
      ctx.fill();
    });
  } else if (/WATERFALL|HISTOGRAM|COLUMN/.test(mode)) {
    drawBars(/WATERFALL/.test(mode));
  } else if (/BAR/.test(mode)) {
    drawBars(false, true);
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(86,213,255,.98)');
    grad.addColorStop(1, 'rgba(118,255,181,.98)');
    ctx.strokeStyle = grad; ctx.lineWidth = 4; ctx.beginPath();
    vals.forEach((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - (v * (h - 26)) - 8;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    if (/AREA/.test(mode)) {
      ctx.fillStyle = 'rgba(86,213,255,.16)'; ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    }
  }
}

function speakBrowser(text) {
  if (!narrationOn || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92; u.pitch = 0.85; u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /Microsoft David|Google UK English Male|Daniel|Google US English/i.test(v.name));
  if (preferred) u.voice = preferred;
  window.speechSynthesis.speak(u);
}

function renderScene(scene, t) {
  if (!scene) return;
  if (scene.id !== lastSceneId) {
    el.chapter.textContent = scene.chapter;
    el.headline.textContent = scene.headline;
    el.narrative.textContent = scene.narration;
    el.activeAgent.textContent = scene.activeAgent;
    el.equation.textContent = scene.equation;
    el.analyticsTitle.textContent = scene.activeAgent;
    el.chartType.textContent = scene.chartType;
    el.chartALabel.textContent = scene.chartA;
    el.chartBLabel.textContent = scene.chartB;
    setAgentGrid(scene.activeAgent);
    el.kpiStrip.innerHTML = Object.entries(scene.kpis).map(([k,v]) => `<div class="kpi"><div class="label">${k}</div><div class="value">${v}</div></div>`).join('');
    el.agentLog.innerHTML = scene.logs.map((l, i) => `<div class="log-row"><span>${l}</span><b>0${i+1}</b></div>`).join('');
    if (isPlaying && (!audio.duration || audio.error)) speakBrowser(scene.narration);
    lastSceneId = scene.id;
  }
  const sceneProgress = (t - scene.start) / Math.max(1, scene.end - scene.start);
  el.heroMetric.textContent = scene.id === 'opening' ? '10' : `${Math.min(99, Math.max(1, Math.round(sceneProgress * 100)))}`;
  drawChart(el.chartA, t, scenes.indexOf(scene) + 1, scene.chartType);
  drawChart(el.chartB, t + 5, scenes.indexOf(scene) + 6, scene.chartType);
}

function tick(now) {
  if (!startTs) startTs = now - pauseAt * 1000;
  const t = Math.min(TOTAL_DURATION, (now - startTs) / 1000);
  el.clock.textContent = fmt(t);
  el.progress.style.width = `${(t / TOTAL_DURATION) * 100}%`;
  renderScene(currentScene(t), t);
  if (t >= TOTAL_DURATION) { stopAtEnd(); return; }
  if (isPlaying) raf = requestAnimationFrame(tick);
}

function startDemo() {
  if (isPlaying) return;
  isPlaying = true;
  startTs = performance.now() - pauseAt * 1000;
  el.video.muted = true;
  el.video.playbackRate = VIDEO_PLAYBACK_RATE;
  el.video.currentTime = Math.min(VIDEO_DURATION_SECONDS - 2, pauseAt * VIDEO_PLAYBACK_RATE);
  el.video.play().catch(()=>{});
  if (narrationOn) {
    audio.currentTime = pauseAt;
    audio.muted = false;
    audio.play().catch(() => speakBrowser(currentScene(pauseAt).narration));
  }
  raf = requestAnimationFrame(tick);
}

function pauseDemo() {
  if (!isPlaying) return;
  isPlaying = false;
  pauseAt = Math.min(TOTAL_DURATION, (performance.now() - startTs) / 1000);
  cancelAnimationFrame(raf);
  el.video.pause();
  audio.pause();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function resetDemo() {
  pauseDemo();
  pauseAt = 0; startTs = null; lastSceneId = null;
  el.video.currentTime = 0; audio.currentTime = 0;
  el.progress.style.width = '0%'; el.clock.textContent = '00:00';
  renderScene(scenes[0], 0);
}

function stopAtEnd() {
  isPlaying = false;
  pauseAt = 0;
  audio.pause(); el.video.pause();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

el.playBtn.addEventListener('click', startDemo);
el.pauseBtn.addEventListener('click', pauseDemo);
el.resetBtn.addEventListener('click', resetDemo);
fetch('data/scenes.json')
  .then(r => r.json())
  .then(data => { scenes = data; renderScene(scenes[0], 0); })
  .catch(err => { console.error(err); el.headline.textContent = 'Could not load scenes.json'; });
