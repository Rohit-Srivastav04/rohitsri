const FEATURED = [
  {
    name: 'We Can Do Devil',
    blurb:
      'Landscape Android platformer — 30 levels, Capacitor + AdMob, signed Play builds.',
    tags: ['TypeScript', 'Capacitor', 'Android'],
    href: 'https://rohit-srivastav04.github.io/',
    kind: 'Game',
  },
  {
    name: 'BeastBrowser',
    blurb:
      'Anti-detect browser SaaS — isolated profiles, proxies, fingerprints. Live product.',
    tags: ['SaaS', 'Chromium', 'Product'],
    href: 'https://beastbrowser.com',
    kind: 'SaaS',
  },
  {
    name: 'BeastPhone AOSP Kit',
    blurb: 'Android 14 guest image kit for BeastBrowser crosvm / WHPX runtime.',
    tags: ['AOSP', 'Shell', 'Systems'],
    href: 'https://github.com/Rohit-Srivastav04/beastphone-aosp-build-kit',
    kind: 'Systems',
  },
  {
    name: 'Killer Aaloo',
    blurb: '2D run-and-gun — 30 levels, bosses, landscape mobile controls.',
    tags: ['TypeScript', 'Game'],
    href: 'https://github.com/Rohit-Srivastav04/killer-aaloo',
    kind: 'Game',
  },
  {
    name: 'VarFox Browser',
    blurb: 'Windows browser release line — packaging & distribution.',
    tags: ['Windows', 'Browser'],
    href: 'https://github.com/Rohit-Srivastav04/varfox',
    kind: 'Product',
  },
  {
    name: 'Beast Traffic API',
    blurb: 'API & traffic tooling for the BeastBrowser ecosystem.',
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
  {
    name: 'Database Console',
    blurb: 'Web database tooling on Vercel.',
    tags: ['JavaScript', 'Vercel'],
    href: 'https://database-cyan-delta.vercel.app',
    kind: 'Web',
  },
  {
    name: 'Codveda Internship',
    blurb: 'Python project set from Codveda Technologies internship.',
    tags: ['Python'],
    href: 'https://github.com/Rohit-Srivastav04/Codveda-Internship-Project',
    kind: 'Backend',
  },
];

const SKIP = new Set([
  'desktop-tutorial',
  'Rohit-Srivastav04',
  'Rohit-srivastav.github.io',
  'rohit',
  'RDP',
  'mainRDP',
  'nextjs-boilerplate',
  'beastbrowser-chromium-148-backup',
  'Codveda-Internship-Projects',
  'Level2_ToDoList',
  'rohitsri',
]);

function projectCard(p, i) {
  const el = document.createElement('a');
  el.className = 'project reveal';
  el.href = p.href;
  el.target = '_blank';
  el.rel = 'noreferrer';
  el.innerHTML = `
    <div class="project-index">${String(i + 1).padStart(2, '0')} · ${p.kind || 'Project'}</div>
    <div>
      <h3>${p.name}</h3>
      <p>${p.blurb}</p>
      <div class="tags">${(p.tags || []).map((t) => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
    <div class="project-link">OPEN ↗</div>
  `;
  return el;
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
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
}

function renderProjects(list) {
  const root = document.getElementById('project-list');
  root.innerHTML = '';
  list.forEach((p, i) => root.appendChild(projectCard(p, i)));
  observeReveals();
}

async function hydrateFromGitHub() {
  try {
    const [userRes, repoRes] = await Promise.all([
      fetch('https://api.github.com/users/Rohit-Srivastav04'),
      fetch('https://api.github.com/users/Rohit-Srivastav04/repos?per_page=100&sort=updated'),
    ]);
    if (userRes.ok) {
      const user = await userRes.json();
      const count = document.getElementById('repo-count');
      if (count) count.textContent = String(user.public_repos ?? '—');
    }
    if (!repoRes.ok) return;
    const repos = await repoRes.json();
    const known = new Set(FEATURED.map((f) => f.name.toLowerCase()));
    const extras = repos
      .filter((r) => !r.fork && !SKIP.has(r.name))
      .filter((r) => r.description || r.homepage)
      .filter((r) => !known.has(r.name.toLowerCase()))
      .slice(0, 3)
      .map((r) => ({
        name: r.name,
        blurb: r.description || 'Open-source project on GitHub.',
        tags: [r.language, ...(r.topics || [])].filter(Boolean).slice(0, 3),
        href: r.homepage || r.html_url,
        kind: 'GitHub',
      }));
    const hrefs = new Set(FEATURED.map((f) => f.href));
    renderProjects([...FEATURED, ...extras.filter((e) => !hrefs.has(e.href))]);
  } catch {
    /* curated list still shows */
  }
}

function setupMenu() {
  const btn = document.getElementById('menu-btn');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

document.getElementById('year').textContent = String(new Date().getFullYear());
setupMenu();
renderProjects(FEATURED);
observeReveals();
hydrateFromGitHub();
