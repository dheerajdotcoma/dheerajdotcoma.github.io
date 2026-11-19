/**
 * Pure HTML templates. Run at build time (and per request in dev) by
 * scripts/vite-plugin-prerender.js, so the shipped index.html already contains every word of
 * content. Do not use DOM APIs here.
 */
import { site, hero, experience, skills, education, certifications, contact, sections } from '../data/content.js';
import projects from '../data/projects.js';
import generated from '../data/assets.generated.js';
import { demos } from '../components/demoRegistry.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const isTodo = (v) => typeof v !== 'string' || v.trim() === '' || v.trim().startsWith('TODO');
const pad = (n) => String(n).padStart(2, '0');
const paras = (d) => (Array.isArray(d) ? d : [d]).filter(Boolean);

export const icons = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V21H9V9Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M3.5 6.5h17v11h-17z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="m3.5 7 8.5 6.5L20.5 7"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3.5h8l4 4v13H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3.5v4h4M9 13h6M9 16.5h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>',
};

/** A link, or — when the href is still a TODO — a clearly-marked disabled placeholder. */
export function linkButton({ label, href }, cls = 'btn btn-ghost', extra = '') {
  if (isTodo(href)) {
    return `<span class="${cls} is-disabled" aria-disabled="true" title="Coming soon" data-todo="${esc(href)}">${esc(label)} <small>(coming soon)</small></span>`;
  }
  const external = /^https?:/i.test(href);
  return `<a class="${cls}" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}${extra}>${esc(label)}${external ? icons.arrow : ''}${external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`;
}

const sectionTitle = (id, title) => {
  const i = sections.findIndex((s) => s.id === id);
  return `<h2 class="section-title" id="${id}-title"><span class="section-num" aria-hidden="true">${pad(i + 1)}</span> ${esc(title)}</h2>`;
};

// ── head ─────────────────────────────────────────────────────────────────────
function renderHead() {
  const og = generated.ogImage || site.ogImage;
  return `<title>${esc(site.title)}</title>
    <meta name="description" content="${esc(site.description)}" />
    <meta name="author" content="${esc(site.name)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(site.title)}" />
    <meta property="og:description" content="${esc(site.description)}" />
    <meta property="og:image" content="${esc(og)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(site.name)}: Backend, Cloud and LLM Security" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(site.title)}" />
    <meta name="twitter:description" content="${esc(site.description)}" />
    <meta name="twitter:image" content="${esc(og)}" />
    ${generated.portrait ? `<link rel="preload" as="image" href="${esc(generated.portrait.src)}" fetchpriority="high" />` : ''}`;
}

// ── header / nav ─────────────────────────────────────────────────────────────
function renderHeader() {
  return `<header class="site-header" id="top">
      <div class="header-inner">
        <a class="brand" href="#main" aria-label="${esc(site.name)}: back to top"><span class="brand-mark" aria-hidden="true"></span>${esc(site.name)}</a>
        <nav class="site-nav" aria-label="Primary">
          <ul>
            ${sections.map((s) => `<li><a href="#${s.id}" data-nav="${s.id}">${esc(s.label)}</a></li>`).join('\n            ')}
          </ul>
        </nav>
      </div>
    </header>`;
}

function renderProgress() {
  return `<nav class="progress" aria-label="Section progress">
      <ol>
        ${sections.map((s, i) => `<li><a href="#${s.id}" data-progress="${s.id}"><span class="progress-num">${pad(i + 1)}</span><span class="progress-dot" aria-hidden="true"></span><span class="progress-label">${esc(s.label)}</span></a></li>`).join('\n        ')}
      </ol>
    </nav>`;
}

// ── hero ─────────────────────────────────────────────────────────────────────
function renderHero() {
  const p = generated.portrait;
  const portrait = p
    ? `<img class="portrait-img" src="${esc(p.src)}" width="${p.width}" height="${p.height}" alt="${esc(hero.portraitAlt)}" fetchpriority="high" decoding="async" />`
    : `<div class="portrait-placeholder" role="img" aria-label="${esc(hero.name)} monogram (portrait coming soon)"><span aria-hidden="true">DSJ</span></div><!-- TODO(owner): add assets/portrait.* and run npm run content -->`;
  return `<section class="hero" id="hero" data-tint="a" aria-labelledby="hero-title">
        <div class="hero-inner reveal">
          <div class="portrait">${portrait}</div>
          <div class="hero-text">
            <p class="tagline">${esc(hero.tagline)}</p>
            <h1 id="hero-title" class="hero-name">${esc(hero.name)}</h1>
            <p class="hero-role">${esc(hero.role)} <span class="hero-loc">· ${esc(hero.location)}</span></p>
            ${hero.bio.map((b) => `<p class="hero-bio">${esc(b)}</p>`).join('\n            ')}
            <div class="hero-actions">
              <a class="btn btn-primary" href="#projects">See the work ${icons.down}</a>
              <a class="btn btn-ghost" href="${esc(hero.resume)}" target="_blank" rel="noopener">${icons.file} Resume (PDF)<span class="visually-hidden"> (opens in a new tab)</span></a>
              <a class="btn btn-ghost" href="#contact">Get in touch</a>
            </div>
          </div>
        </div>
      </section>`;
}

// ── experience ───────────────────────────────────────────────────────────────
function renderExperience() {
  return `<section class="section" id="experience" data-tint="b" aria-labelledby="experience-title">
        <div class="section-inner">
          ${sectionTitle('experience', 'Experience')}
          <ol class="path">
            ${experience.map((e) => `<li class="path-item reveal${e.current ? ' is-current' : ''}">
              <span class="path-node" aria-hidden="true"></span>
              <article class="panel">
                <header class="exp-head">
                  <div>
                    <h3 class="exp-role">${esc(e.role)}</h3>
                    <p class="exp-org">${esc(e.org)}</p>
                  </div>
                  <p class="exp-period">${e.current ? '<span class="live-dot" aria-hidden="true"></span>' : ''}${esc(e.period)}</p>
                </header>
                <ul class="exp-bullets">
                  ${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('\n                  ')}
                </ul>
                ${e.stack?.length ? `<ul class="tags" aria-label="Technologies used">${e.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
              </article>
            </li>`).join('\n            ')}
          </ol>
        </div>
      </section>`;
}

// ── projects ─────────────────────────────────────────────────────────────────
function projectMedia(p, { large }) {
  const m = p.media ?? {};
  if (m.type === 'demo' && m.demo && demos[m.demo]) return demos[m.demo].render(undefined, `${p.id}-demo`);
  if (m.type === 'video' && m.video) {
    const poster = m.poster;
    return `<div class="media media-video">
            <video muted loop playsinline preload="none" data-inview-play ${poster ? `poster="${esc(poster.src)}" width="${poster.width}" height="${poster.height}"` : ''} aria-label="${esc(p.title)}: short screen recording">
              <source src="${esc(m.video.webm)}" type="video/webm" />
              <source src="${esc(m.video.mp4)}" type="video/mp4" />
            </video>
          </div>`;
  }
  const shot = m.screenshots?.[0] ?? (m.poster ? { ...m.poster, alt: `${p.title} preview` } : null);
  if (shot) {
    return `<div class="media media-shot">
            <button type="button" class="media-open" data-open-project="${esc(p.id)}" data-slide="0">
              <img src="${esc(shot.src)}"${shot.srcset ? ` srcset="${esc(shot.srcset)}" sizes="${large ? '(max-width: 900px) calc(100vw - 72px), 560px' : '(max-width: 700px) calc(100vw - 72px), 360px'}"` : ''} width="${shot.width}" height="${shot.height}" alt="${esc(shot.alt)}" loading="lazy" decoding="async" />
              <span class="media-open-label">${m.screenshots?.length > 1 ? `View gallery (${m.screenshots.length})` : 'View larger'}</span>
            </button>
          </div>`;
  }
  return `<div class="media media-none" aria-hidden="true"><span>${esc(p.title.includes(':') ? p.title.split(':')[0] : p.title.split(/\s+/).slice(0, 3).join(' '))}</span></div>`;
}

const metricsList = (p) => (p.metrics?.length
  ? `<ul class="metrics">${p.metrics.map((m) => `<li><span class="metric-value">${esc(m.value)}</span><span class="metric-label">${esc(m.label)}</span></li>`).join('')}</ul>`
  : '');
const stackList = (p) => (p.stack?.length ? `<ul class="tags" aria-label="Tech stack">${p.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '');
const projectButtons = (p) => `<div class="project-actions">
            ${(p.links ?? []).map((l) => linkButton(l, 'btn btn-ghost')).join('\n            ')}
            <a class="btn btn-primary" href="#project-${esc(p.id)}" data-open-project="${esc(p.id)}" aria-haspopup="dialog">Details</a>
          </div>`;

function renderGgtp(list) {
  if (!list.length) return '';
  return `<section class="ggtp panel reveal" aria-labelledby="ggtp-title">
            <div class="ggtp-head">
              <div>
                <h3 class="ggtp-title" id="ggtp-title">GGTP</h3>
                <p class="ggtp-sub">Full-stack products, each built end to end.</p>
              </div>
              <div class="ggtp-nav" hidden>
                <button type="button" class="ggtp-arrow" data-ggtp-dir="-1" aria-label="Scroll GGTP projects left">←</button>
                <button type="button" class="ggtp-arrow" data-ggtp-dir="1" aria-label="Scroll GGTP projects right">→</button>
              </div>
            </div>
            <ul class="ggtp-track" aria-label="GGTP projects">
              ${list.map((p) => `<li><article class="card panel ggtp-card" id="project-${esc(p.id)}" aria-labelledby="project-${esc(p.id)}-title">
                ${projectMedia(p, { large: false })}
                <h4 class="card-title" id="project-${esc(p.id)}-title">${esc(p.title)}</h4>
                <p class="card-summary">${esc(p.summary)}</p>
                ${stackList({ stack: (p.stack ?? []).slice(0, 5) })}
                ${projectButtons(p)}
                <div class="project-details-static">${paras(p.description).map((d) => `<p>${esc(d)}</p>`).join('')}</div>
              </article></li>`).join('\n              ')}
            </ul>
          </section>`;
}

function renderProjects() {
  const ggtp = projects.filter((p) => p.group === 'ggtp');
  const college = projects.filter((p) => p.group !== 'ggtp');
  const featured = college.filter((p) => p.featured).slice(0, 3);
  const rest = college.filter((p) => !featured.includes(p));
  return `<section class="section" id="projects" data-tint="c" aria-labelledby="projects-title">
        <div class="section-inner">
          ${sectionTitle('projects', 'Projects')}
          <div class="featured">
            ${featured.map((p, i) => `<article class="project panel reveal${i % 2 ? ' is-flipped' : ''}" id="project-${esc(p.id)}" aria-labelledby="project-${esc(p.id)}-title">
              <div class="project-body">
                <h3 class="project-title" id="project-${esc(p.id)}-title">${esc(p.title)}</h3>
                <p class="project-summary">${esc(p.summary)}</p>
                ${stackList(p)}
                ${metricsList(p)}
                ${projectButtons(p)}
                <div class="project-details-static">
                  ${paras(p.description).map((d) => `<p>${esc(d)}</p>`).join('\n                  ')}
                </div>
              </div>
              <div class="project-media">
                ${projectMedia(p, { large: true })}
              </div>
            </article>`).join('\n            ')}
            ${renderGgtp(ggtp)}
          </div>
          ${rest.length ? `<h3 class="more-title reveal">More projects</h3>
          <ul class="project-grid">
            ${rest.map((p) => `<li class="reveal"><article class="card panel" id="project-${esc(p.id)}" aria-labelledby="project-${esc(p.id)}-title">
              ${projectMedia(p, { large: false })}
              <h4 class="card-title" id="project-${esc(p.id)}-title">${esc(p.title)}</h4>
              <p class="card-summary">${esc(p.summary)}</p>
              ${stackList(p)}
              ${metricsList(p)}
              ${projectButtons(p)}
              <div class="project-details-static">${paras(p.description).map((d) => `<p>${esc(d)}</p>`).join('')}</div>
            </article></li>`).join('\n            ')}
          </ul>` : ''}
        </div>
      </section>`;
}

// ── skills ───────────────────────────────────────────────────────────────────
/** Deterministic decorative "constellation" behind each pill cluster (viewBox 0–100). */
function constellation(seed, n) {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const count = Math.max(4, Math.min(8, n + 1));
  const pts = Array.from({ length: count }, (_, i) => [
    6 + (88 * i) / (count - 1) + (rnd() - 0.5) * 6,
    18 + rnd() * 64,
  ]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const stars = pts.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join(' ');
  return `<svg class="constellation" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path class="constellation-line" d="${d}" pathLength="1" />
                <path class="constellation-stars" d="${stars}" />
              </svg>`;
}

function renderSkills() {
  return `<section class="section" id="skills" data-tint="d" aria-labelledby="skills-title">
        <div class="section-inner">
          ${sectionTitle('skills', 'Skills')}
          <ul class="skill-groups">
            ${skills.map((g, i) => `<li class="skill-group panel reveal">
              ${constellation(i + 3, g.items.length)}
              <h3 class="skill-title">${esc(g.group)}</h3>
              <ul class="pills">${g.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            </li>`).join('\n            ')}
          </ul>
        </div>
      </section>`;
}

// ── education ────────────────────────────────────────────────────────────────
function renderEducation() {
  return `<section class="section" id="education" data-tint="b" aria-labelledby="education-title">
        <div class="section-inner">
          ${sectionTitle('education', 'Education & Certifications')}
          <div class="edu-layout">
            <ol class="path path-small" aria-label="Education">
              ${education.map((e) => `<li class="path-item reveal">
                <span class="path-node" aria-hidden="true"></span>
                <div class="panel milestone">
                  <p class="milestone-period">${esc(e.period)}</p>
                  <h3 class="milestone-title">${esc(e.title)}</h3>
                  <p class="milestone-org">${esc(e.org)}${e.detail ? ` <span class="milestone-detail">· ${esc(e.detail)}</span>` : ''}</p>
                </div>
              </li>`).join('\n              ')}
            </ol>
            <div class="certs reveal">
              <h3 class="certs-title">Certifications</h3>
              <ul class="cert-list">
                ${certifications.map((c) => `<li class="panel cert">
                  <h4>${esc(c.title)}</h4>
                  <p>${esc(c.detail)}</p>
                  ${isTodo(c.issuer) ? `<!-- ${esc(c.issuer)} -->` : `<p class="cert-issuer">${esc(c.issuer)}</p>`}
                  ${isTodo(c.href) ? `<!-- ${esc(c.href)} -->` : linkButton({ label: 'View certificate', href: c.href }, 'text-link')}
                </li>`).join('\n                ')}
              </ul>
            </div>
          </div>
        </div>
      </section>`;
}

// ── contact ──────────────────────────────────────────────────────────────────
function renderContact() {
  const social = [
    { key: 'github', label: 'GitHub', href: contact.github },
    { key: 'linkedin', label: 'LinkedIn', href: contact.linkedin },
  ];
  return `<section class="section section-contact" id="contact" data-tint="a" aria-labelledby="contact-title">
        <div class="section-inner">
          ${sectionTitle('contact', 'Contact')}
          <div class="panel contact-panel reveal">
            <p class="contact-closing">${esc(contact.closing)}</p>
            <div class="email-row">
              <a class="email-link" href="mailto:${esc(contact.email)}">${icons.mail}<span>${esc(contact.email)}</span></a>
              <button type="button" class="btn btn-ghost btn-copy" data-copy="${esc(contact.email)}" hidden>${icons.copy}<span class="btn-copy-label">Copy email</span></button>
              <span class="copy-status" role="status" aria-live="polite"></span>
            </div>
            <div class="contact-actions">
              ${social.map((s) => (isTodo(s.href)
                ? `<span class="icon-btn is-disabled" aria-disabled="true" title="${s.label}: link coming soon" data-todo="${esc(s.href)}">${icons[s.key]}<span class="visually-hidden">${s.label} (link coming soon)</span></span>`
                : `<a class="icon-btn" href="${esc(s.href)}" target="_blank" rel="noopener noreferrer">${icons[s.key]}<span class="visually-hidden">${s.label} (opens in a new tab)</span></a>`)).join('\n              ')}
              <a class="btn btn-primary" href="${esc(hero.resume)}" target="_blank" rel="noopener">${icons.file} Resume (PDF)<span class="visually-hidden"> (opens in a new tab)</span></a>
            </div>
          </div>
        </div>
      </section>`;
}

function renderFooter() {
  return `<footer class="site-footer">
      <p>© ${site.year} ${esc(site.name)}</p>
      <p class="footer-line"><code>${esc(site.footerLine)}</code></p>
    </footer>`;
}

function renderModal() {
  return `<div class="modal" id="project-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
      <div class="modal-backdrop" data-close></div>
      <div class="modal-card" role="document">
        <button type="button" class="modal-close" data-close aria-label="Close project details"><span aria-hidden="true">×</span></button>
        <div class="modal-content"></div>
      </div>
    </div>`;
}

export function renderAll() {
  return {
    head: renderHead(),
    header: renderHeader(),
    progress: renderProgress(),
    main: [renderHero(), renderExperience(), renderProjects(), renderSkills(), renderEducation(), renderContact()].join('\n      '),
    footer: renderFooter(),
    modal: renderModal(),
  };
}
