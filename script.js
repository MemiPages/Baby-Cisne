// ── COUNTDOWN ──────────────────────────────────────────────
// Domingo 1 de noviembre de 2026, 3:00 PM hora de Ciudad Juárez (UTC-7, ya terminó el horario de verano).
// Con la zona fija, la cuenta es la misma para cualquier invitado, esté donde esté.
const target = new Date('2026-11-01T15:00:00-07:00');

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  let diff = target - new Date();
  if (diff < 0) diff = 0;
  document.getElementById('days').textContent    = Math.floor(diff / 86400000);
  document.getElementById('hours').textContent   = pad(Math.floor(diff % 86400000 / 3600000));
  document.getElementById('minutes').textContent = pad(Math.floor(diff % 3600000 / 60000));
  document.getElementById('seconds').textContent = pad(Math.floor(diff % 60000 / 1000));
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── MUSIC + VIDEO ───────────────────────────────────────────
// La canción se pausa (con fade) cuando suena el video de los latidos
// y vuelve sola cuando el video se pausa o termina.
const MAX_VOL   = 0.75;
const audio     = document.getElementById('bgAudio');
const video     = document.getElementById('heartVideo');
const btn       = document.getElementById('musicBtn');
const iconPlay  = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const tooltip   = btn.querySelector('.music-tooltip');

let fadeTimer = null;
let resumeAfterVideo = false;   // true si la canción sonaba cuando empezó el video

function setPlaying(playing) {
  iconPlay.style.display  = playing ? 'none'  : 'block';
  iconPause.style.display = playing ? 'block' : 'none';
  btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
}

function fadeTo(targetVol, duration, done) {
  clearInterval(fadeTimer);
  const steps = Math.max(1, Math.round(duration / 40));
  const startVol = audio.volume;
  let i = 0;
  fadeTimer = setInterval(() => {
    i++;
    audio.volume = Math.min(1, Math.max(0, startVol + (targetVol - startVol) * (i / steps)));
    if (i >= steps) {
      clearInterval(fadeTimer);
      if (done) done();
    }
  }, 40);
}

function playMusic() {
  audio.volume = 0;
  audio.play().then(() => {
    setPlaying(true);
    fadeTo(MAX_VOL, 1200);
  }).catch(() => {});
}

btn.addEventListener('click', () => {
  tooltip.classList.add('hidden');

  // Si el video está sonando, lo pausamos para que no se encimen los audios
  if (!video.paused) {
    resumeAfterVideo = false;
    video.pause();
  }

  if (audio.paused) {
    playMusic();
  } else {
    clearInterval(fadeTimer);
    audio.pause();
    setPlaying(false);
  }
});

// Al dar play al video: bajar y pausar la canción
video.addEventListener('play', () => {
  if (audio.paused) return;
  resumeAfterVideo = true;
  fadeTo(0, 300, () => {
    audio.pause();
    setPlaying(false);
  });
});

// Al pausar o terminar el video: regresar la canción
function resumeMusic() {
  if (!resumeAfterVideo || document.hidden) return;
  resumeAfterVideo = false;
  playMusic();
}
video.addEventListener('pause', resumeMusic);
video.addEventListener('ended', resumeMusic);

// ── PAUSE ON BLUR ───────────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  resumeAfterVideo = false;
  if (!video.paused) video.pause();
  if (!audio.paused) {
    clearInterval(fadeTimer);
    audio.pause();
    setPlaying(false);
  }
});

// ── SCROLL HINT ─────────────────────────────────────────────
const scrollHint = document.getElementById('scrollHint');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) scrollHint.classList.add('hidden');
}, { passive: true });

// ── SCROLL REVEAL ───────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = (i % 3) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card').forEach(card => observer.observe(card));

// ── SCROLL PROGRESS BAR ─────────────────────────────────────
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
}, { passive: true });

// ── FALLING FEATHERS ────────────────────────────────────────
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Colores: rosa y beige en toda la página, blanco en el hero
const FEATHER_PALETTE = [
  { fill: '#EBC6C0', stroke: '#D9A8A2', opacity: 0.6 },
  { fill: '#F2D0CB', stroke: '#D9A8A2', opacity: 0.55 },
  { fill: '#E8DAC8', stroke: '#CDB89C', opacity: 0.65 },
];
const HERO_FEATHER_PALETTE = [
  { fill: '#FFFFFF', stroke: '#EBC6C0', opacity: 0.9 },
  { fill: '#FFFFFF', stroke: '#E8DAC8', opacity: 0.8 },
  { fill: '#FFF6F3', stroke: '#EBC6C0', opacity: 0.85 },
];

function featherSVG({ fill, stroke, opacity }, width) {
  const height = Math.round(width * 2.1);
  const line = Math.min(1, opacity + 0.25);   // el contorno se nota más que el relleno
  return `<svg width="${width}" height="${height}" viewBox="0 0 16 34" fill="none" aria-hidden="true">
    <path d="M9 1C15 9 14 22 6 33C2 24 1 12 9 1Z" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-opacity="${line}" stroke-width="0.7"/>
    <path d="M9 3C8 14 7 24 6 33" stroke="${stroke}" stroke-opacity="${line}" stroke-width="0.8" stroke-linecap="round"/>
    <path d="M8.4 12L12.6 8.5M7.8 18L13 14M7.2 24L11.6 20.5M8.2 15L4 12.5M7.4 21L3.6 18.5" stroke="${stroke}" stroke-opacity="${line * 0.7}" stroke-width="0.5" stroke-linecap="round"/>
  </svg>`;
}

function spawnFeather(container, hero) {
  const palette = hero ? HERO_FEATHER_PALETTE : FEATHER_PALETTE;
  const colors  = palette[Math.floor(Math.random() * palette.length)];
  const feather = document.createElement('div');
  feather.className = hero ? 'feather feather-hero' : 'feather';
  feather.innerHTML = featherSVG(colors, Math.round(16 + Math.random() * 14));
  feather.style.left = (Math.random() * 100) + '%';
  feather.style.setProperty('--drift', Math.round(Math.random() * 120 - 60) + 'px');
  feather.style.setProperty('--spin',  Math.round(Math.random() * 240 - 120) + 'deg');
  feather.style.animationDuration = ((hero ? 7 : 9) + Math.random() * 7) + 's';
  feather.style.animationDelay    = (Math.random() * (hero ? 2 : 5)) + 's';
  container.appendChild(feather);
  feather.addEventListener('animationend', () => feather.remove());
}

if (!reduceMotion) {
  // Plumas rosas/beige en toda la página
  const featherLayer = document.getElementById('feathers');
  const createFeather = () => { if (!document.hidden) spawnFeather(featherLayer, false); };
  setInterval(createFeather, 1400);
  for (let i = 0; i < 5; i++) setTimeout(createFeather, i * 600);

  // Plumas blancas solo en el hero (y solo mientras es visible)
  const hero = document.querySelector('.hero');
  const createHeroFeather = () => {
    if (!hero || document.hidden) return;
    if (hero.getBoundingClientRect().bottom < 0) return;
    spawnFeather(hero, true);
  };
  setInterval(createHeroFeather, 1000);
  for (let i = 0; i < 8; i++) setTimeout(createHeroFeather, i * 400);
}

// ── IMÁGENES: PRUEBA OTRAS EXTENSIONES SI FALLA LA PRIMERA ──
// (Quita esto cuando confirmes la extensión real de cada imagen
//  y deja el src exacto en el HTML.)
document.querySelectorAll('img[data-exts]').forEach(img => {
  const exts = img.dataset.exts.split(',');
  const base = img.dataset.base;
  let i = 0;
  const tryNext = () => {
    i++;
    if (i < exts.length) img.src = `${base}.${exts[i]}`;
  };
  img.addEventListener('error', tryNext);
  if (img.complete && img.naturalWidth === 0) tryNext();
});
