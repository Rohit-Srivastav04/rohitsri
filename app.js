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

/** Animation clips (journey / one-shots) */
const CLIPS = {
  idle: { folder: 'idle', count: 6, fps: 3.2 },
  blink: { folder: 'blink', count: 4, fps: 10 },
  walk: { folder: 'walk', count: 6, fps: 10 },
  think: { folder: 'think', count: 5, fps: 4 },
  typing: { folder: 'typing', count: 6, fps: 7 },
  wave: { folder: 'wave', count: 6, fps: 9 },
  sit: { folder: 'sit', count: 5, fps: 5 },
};

/** Mouse-look stills (not a GIF loop) */
const LOOK = {
  center: './character/standing/02-hands-in-pockets.png',
  left: './character/standing/04-looking-left.png',
  right: './character/standing/05-looking-right.png',
  up: './character/standing/06-looking-up.png',
  down: './character/standing/07-looking-down.png',
};

const cache = new Map();

function clipUrl(name, i) {
  const c = CLIPS[name] || CLIPS.idle;
  return `./character/${c.folder}/frame-${String(i + 1).padStart(2, '0')}.png`;
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
  Object.keys(CLIPS).forEach((key) => {
    for (let i = 0; i < CLIPS[key].count; i++) loadImage(clipUrl(key, i));
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
 * Interactive cast — NOT a GIF:
 * - Mouse X/Y drives look direction (head-turn + look poses)
 * - Soft parallax toward cursor
 * - Wave once on first hover
 * - Idle/blink only when mouse is still
 * - Journey: scroll-scrubbed walk
 */
function setupCinematicCast() {
  const cast = document.getElementById('cast');
  const canvas = document.getElementById('cast-canvas');
  const hero = document.querySelector('.hero');
  const heroStage = document.getElementById('hero-stage');
  const progress = document.getElementById('scroll-progress');
  if (!cast || !canvas || !hero || !heroStage) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let mode = 'mode-hero';
  let inJourney = false;
  let needsDraw = true;
  let drawnKey = '';
  let last = performance.now();

  // mouse state (smoothed)
  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  let hasMouse = false;
  let waved = false;
  let oneShot = null; // { name, frame, acc }
  let idleAcc = 0;
  let idleFrame = 0;
  let blinkCooldown = 2.4 + Math.random() * 2;
  let walkFrame = 0;

  // section clip when following (not hero mouse-look)
  let followClip = 'idle';
  let followFrame = 0;
  let followAcc = 0;

  async function paint(src, opts = {}) {
    const { parallax = true, key = src } = opts;
    if (drawnKey === key && !needsDraw) return;
    try {
      const img = await loadImage(src);
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      // Fit full body; standing sheets are wider — keep feet grounded
      const scale = Math.min(cw / img.width, ch / img.height) * 0.96;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const ox = parallax ? mx * 8 : 0;
      const oy = parallax ? my * 5 : 0;
      ctx.drawImage(img, (cw - dw) / 2 + ox, ch - dh + oy, dw, dh);
      drawnKey = key;
      needsDraw = false;
    } catch {
      /* skip */
    }
  }

  function lookSource() {
    // Full-body look poses only (head-turn sheets are bust crops)
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
    if (rect.width < 8 || rect.height < 8) return;
    const nx = ((clientX - (rect.left + rect.width / 2)) / (rect.width * 0.55));
    const ny = ((clientY - (rect.top + rect.height * 0.35)) / (rect.height * 0.55));
    tx = Math.max(-1, Math.min(1, nx));
    ty = Math.max(-1, Math.min(1, ny));
    hasMouse = true;

    if (!waved && mode === 'mode-hero' && !inJourney) {
      waved = true;
      oneShot = { name: 'wave', frame: 0, acc: 0 };
    }
    needsDraw = true;
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (window.innerWidth <= 980) return;
      onPointer(e.clientX, e.clientY);
    },
    { passive: true }
  );

  cast.addEventListener(
    'pointermove',
    (e) => {
      onPointer(e.clientX, e.clientY);
    },
    { passive: true }
  );

  // soft reset toward center when idle
  let idleTimer = 0;
  window.addEventListener(
    'pointermove',
    () => {
      idleTimer = 0;
    },
    { passive: true }
  );

  const scenes = document.querySelectorAll('[data-scene]');
  const sceneIo = new IntersectionObserver(
    (entries) => {
      if (inJourney || mode === 'mode-hero') return;
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const next = visible.target.dataset.scene || 'idle';
      if (CLIPS[next] && next !== followClip) {
        followClip = next;
        followFrame = 0;
        followAcc = 0;
        needsDraw = true;
      }
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
        cast.style.left = `${48 + p * 38}%`;
        cast.style.right = 'auto';
        cast.style.transform = '';
        chapters.forEach((node, i) => {
          const center = (i + 0.5) / chapters.length;
          const dist = Math.abs(p - center);
          node.style.opacity = String(Math.max(0.12, 1 - dist * chapters.length * 0.85));
        });
        const idx = Math.min(chapters.length - 1, Math.floor(p * chapters.length));
        const chapterLocal = p * chapters.length - idx;
        const ch = chapters[idx];
        const want = ch?.dataset.scene || 'walk';
        if (chapterLocal < 0.18 || chapterLocal > 0.82 || want === 'walk') {
          walkFrame = Math.floor(p * 48) % CLIPS.walk.count;
          followClip = 'walk';
        } else if (CLIPS[want]) {
          followClip = want;
        }
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

    // smooth mouse
    mx += (tx - mx) * Math.min(1, dt * 8);
    my += (ty - my) * Math.min(1, dt * 8);
    idleTimer += dt;

    // parallax CSS (hero only)
    if (mode === 'mode-hero' && !inJourney) {
      const px = mx * 14;
      const py = my * 8;
      cast.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }

    // drift back to center if mouse idle
    if (idleTimer > 2.8) {
      tx *= 0.96;
      ty *= 0.96;
      if (Math.abs(tx) < 0.02) tx = 0;
      if (Math.abs(ty) < 0.02) ty = 0;
    }

    // JOURNEY / FOLLOW: clip playback
    if (inJourney || mode === 'mode-follow') {
      if (inJourney && followClip === 'walk') {
        paint(clipUrl('walk', walkFrame), { parallax: false, key: `walk:${walkFrame}` });
      } else {
        const clip = CLIPS[followClip] || CLIPS.idle;
        followAcc += dt;
        const step = 1 / (clip.fps || 5);
        while (followAcc >= step) {
          followAcc -= step;
          followFrame = (followFrame + 1) % clip.count;
          needsDraw = true;
        }
        paint(clipUrl(followClip, followFrame), {
          parallax: false,
          key: `${followClip}:${followFrame}`,
        });
      }
      requestAnimationFrame(tick);
      return;
    }

    // HERO: one-shot wave
    if (oneShot) {
      const clip = CLIPS[oneShot.name];
      oneShot.acc += dt;
      const step = 1 / (clip.fps || 8);
      while (oneShot.acc >= step) {
        oneShot.acc -= step;
        oneShot.frame += 1;
      }
      if (oneShot.frame >= clip.count) {
        oneShot = null;
        needsDraw = true;
      } else {
        paint(clipUrl(oneShot.name, oneShot.frame), {
          key: `shot:${oneShot.name}:${oneShot.frame}`,
        });
        requestAnimationFrame(tick);
        return;
      }
    }

    // HERO: mouse look (primary) — not a looping GIF
    const moving = Math.hypot(tx - mx, ty - my) > 0.002 || Math.hypot(mx, my) > 0.08;
    if (hasMouse && moving) {
      const look = lookSource();
      paint(look.src, { key: look.key });
    } else {
      // quiet idle + rare blink
      blinkCooldown -= dt;
      idleAcc += dt;
      const step = 1 / CLIPS.idle.fps;
      while (idleAcc >= step) {
        idleAcc -= step;
        idleFrame = (idleFrame + 1) % CLIPS.idle.count;
        needsDraw = true;
      }
      if (blinkCooldown <= 0) {
        // play blink as short overlay by swapping 1–2 frames
        const bi = Math.min(CLIPS.blink.count - 1, Math.floor((-blinkCooldown) * CLIPS.blink.fps));
        if (bi < CLIPS.blink.count && -blinkCooldown < CLIPS.blink.count / CLIPS.blink.fps) {
          paint(clipUrl('blink', bi), { key: `blink:${bi}` });
        } else {
          blinkCooldown = 2.8 + Math.random() * 3.2;
          paint(clipUrl('idle', idleFrame), { key: `idle:${idleFrame}` });
        }
      } else {
        paint(clipUrl('idle', idleFrame), { key: `idle:${idleFrame}` });
      }
    }

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
