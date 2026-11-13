const FEATURED = [
  {
    name: 'We Can Do Devil',
    blurb:
      'Landscape Android platformer — 30 tricky levels, Capacitor + AdMob, signed Play builds, live privacy & app-ads.txt.',
    tags: ['TypeScript', 'Capacitor', 'Android', 'AdMob'],
    href: 'https://rohit-srivastav04.github.io/',
    kind: 'Game',
  },
  {
    name: 'BeastBrowser',
    blurb:
      'Anti-detect browser product ecosystem — isolated profiles, proxies, and platform-ready fingerprints. Live at beastbrowser.com.',
    tags: ['SaaS', 'Chromium', 'Product'],
    href: 'https://beastbrowser.com',
    kind: 'SaaS',
  },
  {
    name: 'BeastPhone AOSP Build Kit',
    blurb:
      'Open-source kit to build Android 14 guest images (GSI + emu64x + initrd) for BeastBrowser crosvm / WHPX runtime.',
    tags: ['Android', 'AOSP', 'Shell', 'Virtualization'],
    href: 'https://github.com/Rohit-Srivastav04/beastphone-aosp-build-kit',
    kind: 'Systems',
  },
  {
    name: 'Killer Aaloo',
    blurb:
      '2D side-scrolling run-and-gun — 30 levels, bosses, and mobile landscape controls.',
    tags: ['TypeScript', 'Game', 'Mobile'],
    href: 'https://github.com/Rohit-Srivastav04/killer-aaloo',
    kind: 'Game',
  },
  {
    name: 'VarFox Browser',
    blurb: 'Windows browser release line — packaging and distribution for desktop.',
    tags: ['Windows', 'Browser'],
    href: 'https://github.com/Rohit-Srivastav04/varfox',
    kind: 'Product',
  },
  {
    name: 'Beast Traffic API',
    blurb: 'API & traffic tooling for the BeastBrowser ecosystem.',
    tags: ['API', 'SaaS', 'HTML'],
    href: 'https://github.com/Rohit-Srivastav04/beast-traffic-api',
    kind: 'SaaS',
  },
  {
    name: 'Yaad Rakho',
    blurb: 'Android utility app in Kotlin — memory / reminder focused product.',
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
    blurb: 'Web database tooling deployed on Vercel.',
    tags: ['JavaScript', 'Vercel'],
    href: 'https://database-cyan-delta.vercel.app',
    kind: 'Web',
  },
  {
    name: 'Codveda Internship',
    blurb: 'Python project set from Codveda Technologies internship — utilities & practice systems.',
    tags: ['Python', 'Internship'],
    href: 'https://github.com/Rohit-Srivastav04/Codveda-Internship-Project',
    kind: 'Backend',
  },
  {
    name: 'File Encryption',
    blurb: 'Python Level-3 file encryption utilities.',
    tags: ['Python', 'Security'],
    href: 'https://github.com/Rohit-Srivastav04/Level3_FileEncryption',
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
]);

const roles = [
  'Building games',
  'Shipping Android apps',
  'Crafting SaaS tools',
  'Packaging browsers',
  'Full-stack shipping',
];

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
    <div class="project-link">open ↗</div>
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
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
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
      .filter((r) => !known.has(r.name.replace(/-/g, ' ').toLowerCase()) && !known.has(r.name.toLowerCase()))
      .filter((r) => r.description || r.homepage)
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        blurb: r.description || 'Open-source project on GitHub.',
        tags: [r.language, ...(r.topics || [])].filter(Boolean).slice(0, 4),
        href: r.homepage || r.html_url,
        kind: 'GitHub',
      }));

    // Prefer curated FEATURED order; append fresh extras not already covered by href/name
    const featuredHrefs = new Set(FEATURED.map((f) => f.href));
    const merged = [
      ...FEATURED,
      ...extras.filter((e) => !featuredHrefs.has(e.href)),
    ];
    renderProjects(merged);
  } catch {
    // offline / rate-limit — curated list still shows
  }
}

function rotateRoles() {
  const el = document.getElementById('role-rotate');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % roles.length;
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => {
      el.textContent = roles[i];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 220);
  }, 2400);
  el.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
}

document.getElementById('year').textContent = String(new Date().getFullYear());
renderProjects(FEATURED);
observeReveals();
rotateRoles();
hydrateFromGitHub();
