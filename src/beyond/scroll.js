/**
 * Native scrolling only (no scroll-jacking). GSAP ScrollTrigger drives:
 *  - section reveals (fade + 20px rise, staggered children; fade-only for reduced motion)
 *  - the nebula hue drift (section tints)
 *  - active state for the top nav and the side progress dots
 *  - the skills "constellation" stroke, drawn once on reveal
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll({ nebula = null, reducedMotion = false } = {}) {
  const rise = reducedMotion ? 0 : 20;

  // Reveals. Elements start visible in CSS (so content never depends on JS); GSAP hides only what
  // is still below the fold at boot, and reveals it as it enters.
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: reducedMotion ? 0.4 : 0.8, ease: 'power2.out', stagger: 0.08, overwrite: true }),
  });
  // Read all positions first, then write (avoids layout thrashing).
  const reveals = [...document.querySelectorAll('.reveal')];
  const below = reveals.filter((el) => el.getBoundingClientRect().top > innerHeight * 0.88);
  gsap.set(below, { opacity: 0, y: rise });
  // Opacity-only hiding keeps content focusable; reveal instantly if keyboard focus gets there first.
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('.reveal');
    if (el && Number(getComputedStyle(el).opacity) < 1) gsap.to(el, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
  });

  // Constellations: draw the line once when the group appears.
  for (const line of document.querySelectorAll('.constellation-line')) {
    if (reducedMotion) continue;
    gsap.fromTo(line, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut',
      scrollTrigger: { trigger: line.closest('.skill-group'), start: 'top 85%', once: true },
    });
  }

  // Active section → nav, progress dots, nebula tint.
  const sections = [...document.querySelectorAll('main > section[id]')];
  const navLinks = new Map([...document.querySelectorAll('[data-nav]')].map((a) => [a.dataset.nav, a]));
  const dots = new Map([...document.querySelectorAll('[data-progress]')].map((a) => [a.dataset.progress, a]));
  const setActive = (i) => {
    const s = sections[i];
    for (const [id, a] of navLinks) { a.classList.toggle('is-active', id === s.id); id === s.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); }
    for (const [id, a] of dots) { a.classList.toggle('is-active', id === s.id); id === s.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); }
    nebula?.setTint(s.dataset.tint, sections[i + 1]?.dataset.tint ?? s.dataset.tint);
  };
  sections.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && setActive(i),
    });
  });
  setActive(0);

  // Late-loading fonts/images can shift layout; recompute once everything settles.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/** Subtle hover tilt (max 3°) on panels: desktop, fine pointer, motion allowed only. */
export function initTilt() {
  const ok = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
  if (!ok) return;
  const MAX = 3;
  for (const el of document.querySelectorAll('.project, .card, .skill-group, .milestone, .cert')) {
    el.classList.add('is-tiltable');
    let raf = 0;
    el.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        // Bigger panels tilt less, so the movement stays calm.
        const k = Math.min(1, 420 / Math.max(r.width, 1)) * MAX;
        el.style.transform = `perspective(1200px) rotateX(${(-y * k).toFixed(2)}deg) rotateY(${(x * k).toFixed(2)}deg) translateY(-2px)`;
      });
    });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.style.transform = ''; });
  }
}
