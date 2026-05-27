const TOTAL_DURATION = 180;
const VIDEO_DURATION_SECONDS = 180;
const VIDEO_PLAYBACK_RATE = 1;
const AUDIO_PATH = 'assets/audio/aviation-ai-agents-narration.mp3';

let isPlaying = false;
let startTs = null;
let pauseAt = 0;
let raf = null;
let audio = new Audio(AUDIO_PATH);
audio.preload = 'auto';

const el = {
  video: document.getElementById('bgVideo'),
  playBtn: document.getElementById('playBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  resetBtn: document.getElementById('resetBtn'),
  progress: document.getElementById('progress')
};

function tick(now) {
  if (!startTs) startTs = now - pauseAt * 1000;
  const t = Math.min(TOTAL_DURATION, (now - startTs) / 1000);
  el.progress.style.width = `${(t / TOTAL_DURATION) * 100}%`;
  if (t >= TOTAL_DURATION) {
    stopAtEnd();
    return;
  }
  if (isPlaying) raf = requestAnimationFrame(tick);
}

function startDemo() {
  if (isPlaying) return;
  isPlaying = true;
  startTs = performance.now() - pauseAt * 1000;
  el.video.muted = true;
  el.video.playbackRate = VIDEO_PLAYBACK_RATE;
  el.video.currentTime = Math.min(VIDEO_DURATION_SECONDS - 2, pauseAt * VIDEO_PLAYBACK_RATE);
  el.video.play().catch(() => {});
  audio.currentTime = pauseAt;
  audio.muted = false;
  audio.play().catch(() => {});
  raf = requestAnimationFrame(tick);
}

function pauseDemo() {
  if (!isPlaying) return;
  isPlaying = false;
  pauseAt = Math.min(TOTAL_DURATION, (performance.now() - startTs) / 1000);
  cancelAnimationFrame(raf);
  el.video.pause();
  audio.pause();
}

function resetDemo() {
  pauseDemo();
  pauseAt = 0;
  startTs = null;
  el.video.currentTime = 0;
  audio.currentTime = 0;
  el.progress.style.width = '0%';
}

function stopAtEnd() {
  isPlaying = false;
  pauseAt = 0;
  audio.pause();
  el.video.pause();
}

el.playBtn.addEventListener('click', startDemo);
el.pauseBtn.addEventListener('click', pauseDemo);
el.resetBtn.addEventListener('click', resetDemo);
