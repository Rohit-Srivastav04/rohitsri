const FEATURED = [
  {
    name: 'We Can Do Devil',
    blurb: 'Landscape Android platformer with ads and Play-ready builds.',
    tags: ['TypeScript', 'Android', 'Capacitor'],
    href: 'https://rohit-srivastav04.github.io/',
    kind: 'Game',
  },
  {
    name: 'BeastBrowser',
    blurb: 'Anti-detect browser SaaS for profiles, proxies, and fingerprints.',
    tags: ['SaaS', 'Chromium', 'Product'],
    href: 'https://beastbrowser.com',
    kind: 'SaaS',
  },
  {
    name: 'BeastPhone AOSP Kit',
    blurb: 'Android 14 guest image kit for crosvm and WHPX.',
    tags: ['AOSP', 'Shell', 'Systems'],
    href: 'https://github.com/Rohit-Srivastav04/beastphone-aosp-build-kit',
    kind: 'Systems',
  },
  {
    name: 'Killer Aaloo',
    blurb: '2D run-and-gun with 30 levels and landscape controls.',
    tags: ['TypeScript', 'Game'],
    href: 'https://github.com/Rohit-Srivastav04/killer-aaloo',
    kind: 'Game',
  },
  {
    name: 'VarFox Browser',
    blurb: 'Windows browser packaging and release distribution.',
    tags: ['Windows', 'Browser'],
    href: 'https://github.com/Rohit-Srivastav04/varfox',
    kind: 'Product',
  },
  {
    name: 'Beast Traffic API',
    blurb: 'API and traffic tooling for the BeastBrowser stack.',
    tags: ['API', 'SaaS'],
    href: 'https://github.com/Rohit-Srivastav04/beast-traffic-api',
    kind: 'SaaS',
  },
  {
    name: 'Yaad Rakho',
    blurb: 'Android utility app built in Kotlin.',
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

/** 20+ cinematic actions (PNG sequences) */
const ACTIONS = {
  idle: { folder: 'cine/idle', count: 4, fps: 2.6 },
  walk: { folder: 'cine/walk', count: 8, fps: 10 },
  wave: { folder: 'cine/wave', count: 4, fps: 9 },
  think: { folder: 'cine/actions/think', count: 2, fps: 2.2 },
  type: { folder: 'cine/actions/type', count: 2, fps: 5 },
  run: { folder: 'cine/actions/run', count: 2, fps: 8 },
  thumbs: { folder: 'cine/actions/thumbs', count: 1, fps: 1 },
  crossed: { folder: 'cine/actions/crossed', count: 1, fps: 1 },
  point: { folder: 'cine/actions/point', count: 1, fps: 1 },
  shrug: { folder: 'cine/actions/shrug', count: 1, fps: 1 },
  celebrate: { folder: 'cine/actions/celebrate', count: 1, fps: 1 },
  sit: { folder: 'cine/actions/sit', count: 1, fps: 1 },
  bow: { folder: 'cine/actions/bow', count: 1, fps: 1 },
  phone: { folder: 'cine/actions/phone', count: 1, fps: 1 },
  present: { folder: 'cine/actions/present', count: 1, fps: 1 },
  clap: { folder: 'cine/actions/clap', count: 1, fps: 1 },
  turn: { folder: 'cine/actions/turn', count: 1, fps: 1 },
  coffee: { folder: 'cine/actions/coffee', count: 1, fps: 1 },
  handshake: { folder: 'cine/actions/handshake', count: 1, fps: 1 },
  power: { folder: 'cine/actions/power', count: 1, fps: 1 },
  nod: { folder: 'cine/actions/nod', count: 1, fps: 1 },
  watch: { folder: 'cine/actions/watch', count: 1, fps: 1 },
};

const LOOK = {
  center: './character/cine/look/center.png',
  left: './character/cine/look/left.png',
  right: './character/cine/look/right.png',
  up: './character/cine/look/up.png',
  down: './character/cine/look/down.png',
};

/** Showcase reel when mouse is still — cycles many actions */
const SHOWCASE = [
  'idle', 'wave', 'thumbs', 'point', 'crossed', 'think', 'type', 'phone',
  'present', 'coffee', 'shrug', 'nod', 'watch', 'clap', 'power', 'bow',
  'handshake', 'celebrate', 'sit', 'turn', 'run', 'walk',
];

const SECTION_ACTION = {
  journey: 'walk',
  work: 'type',
  stack: 'think',
  about: 'present',
  contact: 'handshake',
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cache = new Map();

function actionUrl(name, i) {
  const a = ACTIONS[name] || ACTIONS.idle;
  return `./character/${a.folder}/frame-${String(i + 1).padStart(2, '0')}.png`;
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
  Object.values(LOOK).forEach((src) => loadImage(src));
  Object.keys(ACTIONS).forEach((key) => {
    for (let i = 0; i < ACTIONS[key].count; i++) loadImage(actionUrl(key, i));
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
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }
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

function setupNav() {
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = `#${visible.target.id}`;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    },
    { rootMargin: '-35% 0px -50% 0px', threshold: [0.1, 0.35, 0.6] }
  );
  sections.forEach((s) => io.observe(s));

  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('mobile-nav');
  if (!toggle || !mobile) return;

  const close = () => {
    mobile.hidden = true;
    mobile.classList.remove('is-open');
    mobile.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    mobile.hidden = false;
    mobile.classList.add('is-open');
    mobile.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  };
  toggle.addEventListener('click', () => (mobile.classList.contains('is-open') ? close() : open()));
  mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}

function setCastMode(cast, mode) {
  cast.classList.remove('mode-hero', 'mode-follow', 'mode-journey');
  cast.classList.add(mode, 'on');
  if (mode !== 'mode-journey') {
    cast.style.left = '';
    cast.style.right = '';
  }
}

function setupCinematicCast() {
  const cast = document.getElementById('cast');
  const canvas = document.getElementById('cast-canvas');
  const hero = document.querySelector('.hero');
  const heroStage = document.getElementById('hero-stage');
  const frame = heroStage?.querySelector('.frame');
  const progress = document.getElementById('scroll-progress');
  if (!cast || !canvas || !hero || !heroStage || !frame) return;

  // Match tall PNG body (actions up to ~840×1400) — contain, never crop
  canvas.width = 900;
  canvas.height = 1400;

  const ctx = canvas.getContext('2d', { alpha: true });
  let mode = 'mode-hero';
  let inJourney = false;
  let needsDraw = true;
  let drawnKey = '';
  let last = performance.now();
  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  let hasMouse = false;
  let idleTimer = 0;

  let action = 'idle';
  let frameIdx = 0;
  let frameAcc = 0;
  let walkFrame = 0;

  let showcaseIdx = 0;
  let showcaseHold = 0;
  const SHOW_HOLD = 1.35;

  let oneShot = null;

  async function paint(src, opts = {}) {
    const { parallax = true, key = src } = opts;
    if (drawnKey === key && !needsDraw) return;
    try {
      const img = await loadImage(src);
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      // Full body always visible (contain + pad) — layout sized to character
      const pad = 0.94;
      const scale = Math.min(cw / img.width, ch / img.height) * pad;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const ox = parallax && !reducedMotion ? mx * 8 : 0;
      const oy = parallax && !reducedMotion ? my * 5 : 0;
      ctx.drawImage(img, (cw - dw) / 2 + ox, (ch - dh) / 2 + oy, dw, dh);
      drawnKey = key;
      needsDraw = false;
    } catch {
      /* skip */
    }
  }

  function setAction(name) {
    if (!ACTIONS[name]) name = 'idle';
    if (action !== name) {
      action = name;
      frameIdx = 0;
      frameAcc = 0;
      needsDraw = true;
    }
  }

  function lookSource() {
    const ax = Math.abs(mx);
    const ay = Math.abs(my);
    if (ay > ax && my < -0.28) return { src: LOOK.up, key: 'look:up' };
    if (ay > ax && my > 0.32) return { src: LOOK.down, key: 'look:down' };
    if (mx < -0.22) return { src: LOOK.left, key: 'look:left' };
    if (mx > 0.22) return { src: LOOK.right, key: 'look:right' };
    return { src: LOOK.center, key: 'look:center' };
  }

  function onPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 8) return;
    const nx = (clientX - (rect.left + rect.width / 2)) / (rect.width * 0.55);
    const ny = (clientY - (rect.top + rect.height * 0.35)) / (rect.height * 0.55);
    tx = Math.max(-1, Math.min(1, nx));
    ty = Math.max(-1, Math.min(1, ny));
    hasMouse = true;
    idleTimer = 0;
    needsDraw = true;
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (window.innerWidth <= 980 || reducedMotion) return;
      onPointer(e.clientX, e.clientY);
    },
    { passive: true }
  );

  // click frame → random showcase action burst
  frame.addEventListener('click', () => {
    const pick = SHOWCASE[Math.floor(Math.random() * SHOWCASE.length)];
    oneShot = { name: pick, hold: pick === 'walk' || pick === 'run' || pick === 'wave' || pick === 'type' || pick === 'think' ? 1.6 : 1.1, t: 0, frame: 0, acc: 0 };
  });

  const journey = document.getElementById('journey');
  const track = document.getElementById('journey-track');
  const fill = document.getElementById('journey-fill');
  const chapters = [...document.querySelectorAll('.chapter')];

  // section → action
  const sectionEls = Object.keys(SECTION_ACTION)
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const sectionIo = new IntersectionObserver(
    (entries) => {
      if (inJourney || mode === 'mode-hero') return;
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const next = SECTION_ACTION[visible.target.id];
      if (next) setAction(next);
    },
    { threshold: [0.35, 0.55] }
  );
  sectionEls.forEach((el) => sectionIo.observe(el));

  function placeCastInHero() {
    if (cast.parentElement !== frame) frame.appendChild(cast);
    setCastMode(cast, 'mode-hero');
    mode = 'mode-hero';
  }

  function placeCastFixed(nextMode) {
    if (cast.parentElement !== document.body) document.body.appendChild(cast);
    setCastMode(cast, nextMode);
    mode = nextMode;
  }

  function updateLayout() {
    const desktop = window.innerWidth > 980;
    const heroRect = hero.getBoundingClientRect();
    const heroStillVisible = heroRect.bottom > 140;

    if (!desktop) {
      placeCastInHero();
      if (track) track.style.transform = '';
      document.body.classList.remove('in-journey');
      inJourney = false;
      cast.style.transform = '';
      return;
    }

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
        cast.style.left = `${42 + p * 42}%`;
        cast.style.right = 'auto';
        cast.style.transform = '';
        chapters.forEach((node, i) => {
          const center = (i + 0.5) / chapters.length;
          const dist = Math.abs(p - center);
          node.style.opacity = String(Math.max(0.12, 1 - dist * chapters.length * 0.85));
        });
        // alternate walk/run through journey
        const useRun = p > 0.35 && p < 0.7;
        setAction(useRun ? 'run' : 'walk');
        walkFrame = Math.floor(p * 72) % ACTIONS[action].count;
        needsDraw = true;
        return;
      }
      track.style.transform = '';
      if (fill) fill.style.width = '0%';
      chapters.forEach((node) => {
        node.style.opacity = '';
      });
    }

    if (heroStillVisible) placeCastInHero();
    else placeCastFixed('mode-follow');
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
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    mx += (tx - mx) * Math.min(1, dt * 9);
    my += (ty - my) * Math.min(1, dt * 9);
    idleTimer += dt;

    if (mode === 'mode-hero' && !inJourney && !reducedMotion) {
      cast.style.transform = `translate3d(${mx * 16}px, ${my * 10}px, 0)`;
    }

    if (idleTimer > 2.4) {
      tx *= 0.94;
      ty *= 0.94;
      if (Math.abs(tx) < 0.02) tx = 0;
      if (Math.abs(ty) < 0.02) ty = 0;
    }

    // Journey scrub
    if (inJourney) {
      paint(actionUrl(action, walkFrame), { parallax: false, key: `${action}:${walkFrame}` });
      requestAnimationFrame(tick);
      return;
    }

    // Click one-shot
    if (oneShot) {
      oneShot.t += dt;
      const clip = ACTIONS[oneShot.name] || ACTIONS.idle;
      if (clip.count > 1) {
        oneShot.acc += dt;
        const step = 1 / clip.fps;
        while (oneShot.acc >= step) {
          oneShot.acc -= step;
          oneShot.frame = (oneShot.frame + 1) % clip.count;
          needsDraw = true;
        }
        paint(actionUrl(oneShot.name, oneShot.frame), { key: `shot:${oneShot.name}:${oneShot.frame}` });
      } else {
        paint(actionUrl(oneShot.name, 0), { key: `shot:${oneShot.name}` });
      }
      if (oneShot.t >= oneShot.hold) oneShot = null;
      requestAnimationFrame(tick);
      return;
    }

    // Follow mode: section action loop
    if (mode === 'mode-follow') {
      const clip = ACTIONS[action] || ACTIONS.idle;
      frameAcc += dt;
      const step = 1 / (clip.fps || 3);
      while (frameAcc >= step) {
        frameAcc -= step;
        frameIdx = (frameIdx + 1) % Math.max(1, clip.count);
        needsDraw = true;
      }
      paint(actionUrl(action, frameIdx), { parallax: false, key: `follow:${action}:${frameIdx}` });
      requestAnimationFrame(tick);
      return;
    }

    // Hero: mouse look overrides
    const moving = Math.hypot(tx - mx, ty - my) > 0.002 || Math.hypot(mx, my) > 0.12;
    if (hasMouse && moving && !reducedMotion) {
      const look = lookSource();
      paint(look.src, { key: look.key });
      requestAnimationFrame(tick);
      return;
    }

    // Hero: showcase reel of 20+ actions when idle
    if (!reducedMotion) {
      showcaseHold += dt;
      if (showcaseHold >= SHOW_HOLD) {
        showcaseHold = 0;
        showcaseIdx = (showcaseIdx + 1) % SHOWCASE.length;
        setAction(SHOWCASE[showcaseIdx]);
      }
    } else {
      setAction('idle');
    }

    const clip = ACTIONS[action] || ACTIONS.idle;
    frameAcc += dt;
    const step = 1 / (clip.fps || 3);
    while (frameAcc >= step) {
      frameAcc -= step;
      frameIdx = (frameIdx + 1) % Math.max(1, clip.count);
      needsDraw = true;
    }
    paint(actionUrl(action, frameIdx), { key: `hero:${action}:${frameIdx}` });
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
const hint = document.querySelector('.scroll-cue span:last-child');
if (hint) hint.textContent = 'Move mouse · click character · scroll';

preloadAll();
setupNav();
setupCinematicCast();
renderProjects(FEATURED);
observeReveals();
hydrateFromGitHub();
