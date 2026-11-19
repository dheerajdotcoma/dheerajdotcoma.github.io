/**
 * Accessible project details modal with a media carousel.
 * - Opened by any [data-open-project="<id>"] (optionally data-slide="<n>").
 * - role="dialog" + aria-modal, background made `inert`, Tab/Shift+Tab trapped, Esc closes,
 *   focus returns to the element that opened it.
 * - Carousel: buttons, ←/→ keys, swipe; off-screen slides are inert; slide changes announced.
 */
import projects from '../data/projects.js';
import { isTodo, linkButton } from '../render/templates.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), video[controls], input, select, textarea';

function slidesFor(p) {
  const m = p.media ?? {};
  const slides = [];
  if (m.video) slides.push({ kind: 'video', ...m.video, poster: m.poster?.src, alt: `${p.title}: screen recording`, caption: 'Screen recording' });
  for (const s of m.screenshots ?? []) slides.push({ kind: 'image', ...s });
  return slides;
}

function modalHtml(p) {
  const slides = slidesFor(p);
  const desc = (Array.isArray(p.description) ? p.description : [p.description]).filter(Boolean);
  const carousel = slides.length ? `
    <div class="carousel" role="group" aria-roledescription="carousel" aria-label="${esc(p.title)} media">
      <div class="carousel-viewport">
        <div class="carousel-track">
          ${slides.map((s, i) => `<figure class="carousel-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}">
            ${s.kind === 'video'
              ? `<video controls muted loop playsinline preload="metadata" ${s.poster ? `poster="${esc(s.poster)}"` : ''} aria-label="${esc(s.alt)}"><source src="${esc(s.webm)}" type="video/webm"><source src="${esc(s.mp4)}" type="video/mp4"></video>`
                        : `<img src="${esc(s.src)}"${s.srcset ? ` srcset="${esc(s.srcset)}" sizes="(max-width: 960px) calc(100vw - 72px), 850px"` : ''} width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" decoding="async" ${i ? 'loading="lazy"' : ''}>`}
            ${s.caption && !isTodo(s.caption) ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}
          </figure>`).join('')}
        </div>
      </div>
      ${slides.length > 1 ? `<div class="carousel-controls">
        <button type="button" class="carousel-btn" data-dir="-1" aria-label="Previous slide">←</button>
        <span class="carousel-count" aria-hidden="true"></span>
        <button type="button" class="carousel-btn" data-dir="1" aria-label="Next slide">→</button>
      </div>
      <p class="visually-hidden" aria-live="polite" data-carousel-live></p>` : ''}
    </div>` : '';
  const roles = p.roles?.length ? `
    <h3 class="modal-section-title">Who uses it</h3>
    <ul class="roles">${p.roles.map((r) => `<li><span class="role-name">${esc(r.name)}</span><span class="role-does">${esc(r.does)}</span></li>`).join('')}</ul>` : '';
  const flow = p.flow?.length ? `
    <h3 class="modal-section-title">How it works, end to end</h3>
    <p class="flow-hint">Select a step to see what happens under the hood.</p>
    <div class="flow">
      <ol class="flow-steps" style="--flow-n: ${p.flow.length}" role="tablist" aria-label="${esc(p.title)}: end-to-end flow">
        ${p.flow.map((s, i) => `<li role="presentation"><button type="button" class="flow-step" role="tab" id="flow-tab-${i}" aria-controls="flow-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-flow-step="${i}">
          <span class="flow-num" aria-hidden="true">${i + 1}</span>
          <span class="flow-title">${esc(s.title)}</span>
          <span class="flow-plain">${esc(s.plain)}</span>
        </button></li>`).join('')}
      </ol>
      <div class="flow-panel" id="flow-panel" role="tabpanel" aria-labelledby="flow-tab-0" aria-live="polite">
        <p class="flow-panel-step"><span data-flow-label>Step 1 · ${esc(p.flow[0].title)}</span></p>
        <p data-flow-tech>${esc(p.flow[0].tech)}</p>
      </div>
    </div>` : '';
  const highlights = p.highlights?.length ? `
    <h3 class="modal-section-title">Highlights</h3>
    <ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : '';
  return `
    ${p.group === 'ggtp' ? '<p class="modal-eyebrow">GGTP</p>' : ''}
    <h2 class="modal-title" id="modal-title">${esc(p.title)}</h2>
    <p class="modal-summary">${esc(p.summary)}</p>
    ${carousel}
    <div class="modal-desc">${desc.map((d) => `<p>${esc(d)}</p>`).join('')}</div>
    ${roles}
    ${flow}
    ${highlights}
    ${p.metrics?.length ? `<h3 class="modal-section-title">Results</h3><ul class="metrics">${p.metrics.map((m) => `<li><span class="metric-value">${esc(m.value)}</span><span class="metric-label">${esc(m.label)}</span></li>`).join('')}</ul>` : ''}
    ${p.stack?.length ? `<h3 class="modal-section-title">Stack</h3><ul class="tags">${p.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${p.links?.length ? `<div class="project-actions">${p.links.map((l) => linkButton(l, 'btn btn-ghost')).join('')}</div>` : ''}`;
}

export function initProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  const card = modal.querySelector('.modal-card');
  const content = modal.querySelector('.modal-content');
  const background = [...document.querySelectorAll('body > header, body > nav, body > main, body > footer')];
  let opener = null;
  let cleanup = () => {};

  const open = (id, slide = 0, trigger = null) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    opener = trigger ?? document.activeElement;
    content.innerHTML = modalHtml(p);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    background.forEach((el) => (el.inert = true));
    cleanup = setupCarousel(content, slide);
    setupFlow(content, p);
    card.scrollTop = 0;
    modal.querySelector('.modal-close').focus();
  };

  const close = () => {
    if (modal.hidden) return;
    cleanup();
    modal.hidden = true;
    content.innerHTML = '';
    document.body.classList.remove('modal-open');
    background.forEach((el) => (el.inert = false));
    opener?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-project]');
    if (t) {
      e.preventDefault();
      open(t.dataset.openProject, Number(t.dataset.slide || 0), t);
      return;
    }
    if (!modal.hidden && e.target.closest('[data-close]')) close();
  });

  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const items = [...card.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[inert]') && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

/** End-to-end flow: a tablist of steps; the selected step's technical note shows below. */
function setupFlow(scope, p) {
  const list = scope.querySelector('.flow-steps');
  if (!list) return;
  const tabs = [...list.querySelectorAll('.flow-step')];
  const panel = scope.querySelector('.flow-panel');
  const label = panel.querySelector('[data-flow-label]');
  const tech = panel.querySelector('[data-flow-tech]');
  const select = (n, focus = false) => {
    const i = (n + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    label.textContent = `Step ${i + 1} · ${p.flow[i].title}`;
    tech.textContent = p.flow[i].tech;
    if (focus) tabs[i].focus();
  };
  list.addEventListener('click', (e) => {
    const t = e.target.closest('[data-flow-step]');
    if (t) select(Number(t.dataset.flowStep));
  });
  list.addEventListener('keydown', (e) => {
    const cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (move) { e.preventDefault(); e.stopPropagation(); select(cur + move, true); }
    else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
  });
}

/** GGTP row: horizontal scroll-snap track with prev/next arrows (shown only when it overflows). */
export function initGgtpRow() {
  const track = document.querySelector('.ggtp-track');
  const nav = document.querySelector('.ggtp-nav');
  if (!track || !nav) return;
  const [prev, next] = nav.querySelectorAll('[data-ggtp-dir]');
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    nav.hidden = max <= 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ggtp-dir]');
    if (!b) return;
    const card = track.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth * 0.8;
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: step * Number(b.dataset.ggtpDir), behavior: smooth ? 'smooth' : 'auto' });
  });
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

function setupCarousel(scope, start) {
  const root = scope.querySelector('.carousel');
  if (!root) return () => {};
  const track = root.querySelector('.carousel-track');
  const slides = [...root.querySelectorAll('.carousel-slide')];
  const prev = root.querySelector('[data-dir="-1"]');
  const next = root.querySelector('[data-dir="1"]');
  const count = root.querySelector('.carousel-count');
  const live = root.querySelector('[data-carousel-live]');
  let i = 0;

  const go = (n, announce = true) => {
    i = Math.max(0, Math.min(slides.length - 1, n));
    track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, j) => {
      s.inert = j !== i;
      s.setAttribute('aria-hidden', String(j !== i));
      const v = s.querySelector('video');
      if (v && j !== i) v.pause();
    });
    if (prev) {
      const had = document.activeElement;
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
      // Never strand keyboard focus on a button that just became disabled.
      if (had?.disabled) (had === next ? prev : next).focus();
    }
    if (count) count.textContent = `${i + 1} / ${slides.length}`;
    if (live && announce) {
      const cap = slides[i].querySelector('figcaption')?.textContent ?? slides[i].querySelector('img,video')?.getAttribute('alt') ?? '';
      live.textContent = `Slide ${i + 1} of ${slides.length}: ${cap}`;
    }
  };

  const onClick = (e) => { const b = e.target.closest('[data-dir]'); if (b) go(i + Number(b.dataset.dir)); };
  const onKey = (e) => {
    if (slides.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
  };
  // Swipe (pointer events; vertical scrolling still works thanks to touch-action: pan-y).
  let x0 = null;
  const vp = root.querySelector('.carousel-viewport');
  const onDown = (e) => { x0 = e.clientX; };
  const onUp = (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  };
  root.addEventListener('click', onClick);
  const modal = root.closest('.modal');
  const onKeyGuard = (e) => { if (!modal.hidden) onKey(e); };
  document.addEventListener('keydown', onKeyGuard);
  vp.addEventListener('pointerdown', onDown);
  vp.addEventListener('pointerup', onUp);
  vp.addEventListener('pointercancel', () => (x0 = null));
  go(start, false);
  return () => document.removeEventListener('keydown', onKeyGuard);
}

/** Panel videos: play only while on screen; never autoplay for reduced motion. */
export function initInViewVideos() {
  const vids = document.querySelectorAll('video[data-inview-play]');
  if (!vids.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    vids.forEach((v) => { v.controls = true; v.preload = 'metadata'; });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
      else v.pause();
    }
  }, { threshold: 0.35 });
  vids.forEach((v) => io.observe(v));
}
