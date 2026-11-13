const FEATURED = [
  {
    name: 'We Can Do Devil',
    blurb: 'Landscape Android platformer — Capacitor, AdMob, Play-ready builds.',
    tags: ['TypeScript', 'Android', 'Capacitor'],
    href: 'https://rohit-srivastav04.github.io/',
    kind: 'Game',
  },
  {
    name: 'BeastBrowser',
    blurb: 'Anti-detect browser SaaS — profiles, proxies, fingerprints.',
    tags: ['SaaS', 'Chromium', 'Product'],
    href: 'https://beastbrowser.com',
    kind: 'SaaS',
  },
  {
    name: 'BeastPhone AOSP Kit',
    blurb: 'Android 14 guest image kit for crosvm / WHPX runtime.',
    tags: ['AOSP', 'Shell', 'Systems'],
    href: 'https://github.com/Rohit-Srivastav04/beastphone-aosp-build-kit',
    kind: 'Systems',
  },
  {
    name: 'Killer Aaloo',
    blurb: '2D run-and-gun — 30 levels, bosses, landscape controls.',
    tags: ['TypeScript', 'Game'],
    href: 'https://github.com/Rohit-Srivastav04/killer-aaloo',
    kind: 'Game',
  },
  {
    name: 'VarFox Browser',
    blurb: 'Windows browser release packaging & distribution.',
    tags: ['Windows', 'Browser'],
    href: 'https://github.com/Rohit-Srivastav04/varfox',
    kind: 'Product',
  },
  {
    name: 'Beast Traffic API',
    blurb: 'API & traffic tooling for BeastBrowser ecosystem.',
    tags: ['API', 'SaaS'],
    href: 'https://github.com/Rohit-Srivastav04/beast-traffic-api',
    kind: 'SaaS',
  },
  {
    name: 'Yaad Rakho',
    blurb: 'Android utility app in Kotlin.',
    tags: ['Kotlin', 'Android'],
    href: 'https://github.com/Rohit-Srivastav04/yaad-rakho',
    kind: 'App',
  },
  {
    name: 'Arrow Logic',
    blurb: 'Brain-training puzzle game for Android.',
    tags: ['Kotlin', 'Game'],
    href: 'https://github.com/Rohit-Srivastav04/Arrow-logic',
    kind: 'Game',
  },
];

const SCENES = {
  greet: { folder: 'greet', count: 5, fps: 7 },
  idle: { folder: 'idle', count: 6, fps: 5 },
  walk: { folder: 'walk', count: 6, fps: 10 },
  think: { folder: 'think', count: 5, fps: 5 },
  typing: { folder: 'typing', count: 6, fps: 8 },
  wave: { folder: 'wave', count: 6, fps: 8 },
  sit: { folder: 'sit', count: 5, fps: 6 },
};

const cache = new Map();

function frameUrl(scene, i) {
  const s = SCENES[scene] || SCENES.idle;
  return `./character/${s.folder}/frame-${String(i + 1).padStart(2, '0')}.png`;
}

function loadImage(src) {
  if (cache.has(src)) return cache.get(src);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  cache.set(src, p);
  return p;
}

function preloadAll() {
  Object.keys(SCENES).forEach((key) => {
    const s = SCENES[key];
    for (let i = 0; i < s.count; i++) loadImage(frameUrl(key, i));
  });
}

function projectCard(p, i) {
  const el = document.createElement('a');
  el.className = 'project reveal';
  el.href = p.href;
  el.target = '_blank';
  el.rel = 'noreferrer';
  el.innerHTML = `
    <div class="project-index">${String(i + 1).padStart(2, '0')} · ${p.kind}</div>
    <div>
      <h3>${p.name}</h3>
      <p>${p.blurb}</p>
      <div class="tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
    <div class="project-link">OPEN ↗</div>
  `;
  return el;
}

function renderProjects(list) {
  const root = document.getElementById('project-list');
  root.innerHTML = '';
  list.forEach((p, i) => root.appendChild(projectCard(p, i)));
  observeReveals();
}

function observeReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
}

function setCastMode(cast, mode) {
  cast.classList.remove('mode-hero', 'mode-follow', 'mode-journey');
  cast.classList.add(mode, 'on');
  if (mode !== 'mode-journey') {
    cast.style.left = '';
    cast.style.right = '';
  }
}

/**
 * One character canvas:
 * - Hero: large, greets in the right column (replaces photo)
 * - Follow: compact fixed companion after hero
 * - Journey: walks left→right, frames scrubbed by scroll
 */
function setupCinematicCast() {
  const cast = document.getElementById('cast');
  const canvas = document.getElementById('cast-canvas');
  const hero = document.querySelector('.hero');
  const heroStage = document.getElementById('hero-stage');
  const progress = document.getElementById('scroll-progress');
  if (!cast || !canvas || !hero || !heroStage) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let scene = 'greet';
  let frame = 0;
  let acc = 0;
  let last = performance.now();
  let inJourney = false;
  let drawn = null;
  let needsDraw = true;
  let mode = 'mode-hero';

  async function drawFrame(sceneKey, index) {
    const cfg = SCENES[sceneKey] || SCENES.idle;
    const i = ((index % cfg.count) + cfg.count) % cfg.count;
    const key = `${sceneKey}:${i}`;
    if (drawn === key && !needsDraw) return;
    try {
      const img = await loadImage(frameUrl(sceneKey, i));
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      const scale = Math.min(cw / img.width, ch / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (cw - dw) / 2, ch - dh, dw, dh);
      drawn = key;
      needsDraw = false;
    } catch {
      /* missing frame */
    }
  }

  function setScene(next) {
    if (!SCENES[next]) next = 'idle';
    if (scene !== next) {
      scene = next;
      frame = 0;
      acc = 0;
      needsDraw = true;
    }
  }

  const scenes = document.querySelectorAll('[data-scene]');
  const sceneIo = new IntersectionObserver(
    (entries) => {
      if (inJourney || mode === 'mode-hero') return;
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      setScene(visible.target.dataset.scene || 'idle');
    },
    { threshold: [0.35, 0.55, 0.7] }
  );
  scenes.forEach((el) => sceneIo.observe(el));

  const journey = document.getElementById('journey');
  const track = document.getElementById('journey-track');
  const fill = document.getElementById('journey-fill');
  const chapters = [...document.querySelectorAll('.chapter')];

  function placeCastInHero() {
    if (cast.parentElement !== heroStage) heroStage.appendChild(cast);
    setCastMode(cast, 'mode-hero');
    mode = 'mode-hero';
    setScene('greet');
  }

  function placeCastFixed(nextMode) {
    if (cast.parentElement !== document.body) document.body.appendChild(cast);
    setCastMode(cast, nextMode);
    mode = nextMode;
  }

  function updateLayout() {
    const desktop = window.innerWidth > 980;
    const heroRect = hero.getBoundingClientRect();
    const heroStillVisible = heroRect.bottom > 120;

    if (!desktop) {
      placeCastInHero();
      if (track) track.style.transform = '';
      document.body.classList.remove('in-journey');
      inJourney = false;
      return;
    }

    // Journey pin owns the character
    if (journey && track) {
      const rect = journey.getBoundingClientRect();
      const total = journey.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      inJourney = rect.top <= 0 && rect.bottom >= window.innerHeight;
      document.body.classList.toggle('in-journey', inJourney);

      if (inJourney) {
        placeCastFixed('mode-journey');
        track.style.transform = `translate3d(${-p * 75}%, 0, 0)`;
        if (fill) fill.style.width = `${p * 100}%`;
        // Keep character on the floor to the right of chapter copy
        cast.style.left = `${48 + p * 38}%`;
        cast.style.right = 'auto';

        const idx = Math.min(chapters.length - 1, Math.floor(p * chapters.length));
        const chapterLocal = p * chapters.length - idx;
        chapters.forEach((node, i) => {
          const center = (i + 0.5) / chapters.length;
          const dist = Math.abs(p - center);
          node.style.opacity = String(Math.max(0.12, 1 - dist * chapters.length * 0.85));
        });
        const ch = chapters[idx];
        const next = ch?.dataset.scene || 'walk';
        setScene(chapterLocal < 0.18 || chapterLocal > 0.82 ? 'walk' : next);
        if (scene === 'walk') {
          frame = Math.floor(p * 48) % SCENES.walk.count;
          needsDraw = true;
        }
        return;
      }
      track.style.transform = '';
      if (fill) fill.style.width = '0%';
      chapters.forEach((node) => {
        node.style.opacity = '';
      });
    }

    if (heroStillVisible) {
      placeCastInHero();
    } else {
      placeCastFixed('mode-follow');
    }
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = `${p * 100}%`;
    updateLayout();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    needsDraw = true;
    onScroll();
  });
  placeCastInHero();
  onScroll();

  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    const cfg = SCENES[scene] || SCENES.idle;

    if (!(inJourney && scene === 'walk')) {
      acc += dt;
      const step = 1 / (cfg.fps || 6);
      while (acc >= step) {
        acc -= step;
        frame = (frame + 1) % cfg.count;
        needsDraw = true;
      }
    }

    drawFrame(scene, frame);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function hydrateFromGitHub() {
  try {
    const res = await fetch('https://api.github.com/users/Rohit-Srivastav04');
    if (!res.ok) return;
    const user = await res.json();
    const el = document.getElementById('repo-count');
    if (el) el.textContent = String(user.public_repos ?? '—');
  } catch {
    /* ignore */
  }
}

document.getElementById('year').textContent = String(new Date().getFullYear());
preloadAll();
setupCinematicCast();
renderProjects(FEATURED);
observeReveals();
hydrateFromGitHub();
