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
  greet: { folder: 'greet', count: 5, fps: 7, loop: true },
  idle: { folder: 'idle', count: 6, fps: 5, loop: true },
  walk: { folder: 'walk', count: 6, fps: 10, loop: true },
  think: { folder: 'think', count: 5, fps: 5, loop: true },
  typing: { folder: 'typing', count: 6, fps: 8, loop: true },
  wave: { folder: 'wave', count: 6, fps: 8, loop: true },
  sit: { folder: 'sit', count: 5, fps: 6, loop: false },
};

function framesFor(scene) {
  const s = SCENES[scene] || SCENES.idle;
  return Array.from({ length: s.count }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `./character/${s.folder}/frame-${n}.png`;
  });
}

function preloadAll() {
  Object.keys(SCENES).forEach((key) => {
    framesFor(key).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
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

/** Sticky cast + scroll-driven cinematic scenes */
function setupCinematicCast() {
  const cast = document.getElementById('cast');
  const img = document.getElementById('cast-img');
  const label = document.getElementById('cast-label');
  const progress = document.getElementById('scroll-progress');
  if (!cast || !img) return;

  let scene = 'greet';
  let frame = 0;
  let acc = 0;
  let last = performance.now();
  let walkScrollDrive = false;
  let walkProgress = 0;

  function setScene(next, nextLabel) {
    if (!SCENES[next]) next = 'idle';
    if (scene !== next) {
      scene = next;
      frame = 0;
      acc = 0;
      img.src = framesFor(scene)[0];
    }
    if (nextLabel) label.textContent = nextLabel;
    walkScrollDrive = next === 'walk';
  }

  // Section observers for scene changes
  const scenes = document.querySelectorAll('[data-scene]');
  const sceneIo = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      // don't override while journey pin owns walk
      if (document.body.classList.contains('in-journey')) return;
      const el = visible.target;
      setScene(el.dataset.scene, el.dataset.label || el.dataset.scene.toUpperCase());
    },
    { threshold: [0.35, 0.55, 0.7] }
  );
  scenes.forEach((el) => sceneIo.observe(el));

  // Journey horizontal pin (desktop)
  const journey = document.getElementById('journey');
  const track = document.getElementById('journey-track');
  const fill = document.getElementById('journey-fill');
  const chapters = [...document.querySelectorAll('.chapter')];

  function updateJourney() {
    if (!journey || !track) return;
    if (window.innerWidth <= 980) {
      track.style.transform = '';
      document.body.classList.remove('in-journey');
      return;
    }
    const rect = journey.getBoundingClientRect();
    const total = journey.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;

    const inView = rect.top <= 0 && rect.bottom >= window.innerHeight;
    document.body.classList.toggle('in-journey', inView);
    cast.classList.toggle('on', true);

    if (inView) {
      track.style.transform = `translate3d(${-p * 75}%, 0, 0)`;
      if (fill) fill.style.width = `${p * 100}%`;
      walkProgress = p;
      const idx = Math.min(chapters.length - 1, Math.floor(p * chapters.length));
      const ch = chapters[idx];
      if (ch) setScene(ch.dataset.scene || 'walk', ch.dataset.label || 'JOURNEY');
    }
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = `${p * 100}%`;
    cast.classList.toggle('on', window.scrollY > 40);
    updateJourney();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    const cfg = SCENES[scene] || SCENES.idle;
    const list = framesFor(scene);

    if (walkScrollDrive && scene === 'walk') {
      // scroll position drives walk frame
      frame = Math.floor(walkProgress * 40) % list.length;
      img.src = list[frame];
    } else {
      acc += dt;
      const step = 1 / (cfg.fps || 6);
      while (acc >= step) {
        acc -= step;
        frame = (frame + 1) % list.length;
        img.src = list[frame];
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
