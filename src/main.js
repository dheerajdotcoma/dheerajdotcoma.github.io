/**
 * Boot: intro (or skip) → main site.
 *
 * The full page is already in the HTML (prerendered). An inline script in <head> adds
 * `intro-pending` when the intro should play (first visit this session, motion allowed, no deep
 * link), which covers the page with the dark stage. Every path ends in `revealSite()`.
 */
import { gsap } from 'gsap';
import { demos } from './components/demoRegistry.js';
import { initContact } from './components/contact.js';
import { initProjectModal, initInViewVideos, initGgtpRow } from './components/projectModal.js';
import { detectCapabilities, TIER_SETTINGS } from './capabilities.js';
import { initScroll, initTilt } from './beyond/scroll.js';
import { mountRequest } from './intro/request.js';
import { hero, intro as introContent, experience } from './data/content.js';

const LOAD_BUDGET_MS = 1200; // waiting for the display font; a late intro is worse than none
const root = document.documentElement;
clearTimeout(window.__introFailsafe);
const caps = detectCapabilities();
root.dataset.tier = caps.tier;

const page = [...document.querySelectorAll('body > header, body > nav, body > main, body > footer')];
const stage = document.getElementById('intro');
const skipBtn = document.getElementById('intro-skip');
let siteReady = false;

// Page behaviour works regardless of the intro.
for (const el of document.querySelectorAll('[data-demo]')) demos[el.dataset.demo]?.mount(el);
initContact();
initProjectModal();
initInViewVideos();
initGgtpRow();

if (root.classList.contains('intro-pending')) runIntro();
else revealSite();

// ─────────────────────────────────────────────────────────────────────────────
async function runIntro() {
  let ended = false;
  page.forEach((el) => (el.inert = true));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  skipBtn.hidden = false;
  skipBtn.onclick = () => finish(); // skip while still loading

  let run = null;
  const onKey = (e) => { if (e.key === 'Escape') (run ? run.skip() : finish()); };
  addEventListener('keydown', onKey);

  // Build the stage now, then wait (briefly) for the display font before playing.
  const intro = mountRequest(stage, { name: hero.name, hero, intro: introContent, experience });
  const inTime = await Promise.race([intro.ready.then(() => true), new Promise((r) => setTimeout(() => r(false), LOAD_BUDGET_MS))]);
  if (!inTime || ended) { removeEventListener('keydown', onKey); return finish(); }

  const heroHeading = document.querySelector('.hero-name');
  root.classList.add('intro-active');
  // Un-hide the page BEHIND the opaque stage now and give the browser two frames to paint it.
  // Otherwise its first full paint (frosted-glass blurs included) lands mid-reveal and stutters.
  root.classList.add('intro-landing'); // the real heading stays hidden until the name lands
  root.classList.remove('intro-pending');
  // Promote the page to its own layers now, so the zoom/shake at the end doesn't trigger a re-raster.
  page.forEach((el) => (el.style.willChange = 'transform'));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 120)); // let rasterisation finish while the screen is still dark
  if (ended) return;
  run = intro.play({
    heroHeading,
    pageEls: page,
    onReveal: ({ skipped, landed } = {}) => {
      if (skipped || landed) root.classList.remove('intro-landing'); // the real heading takes over
      showPage(); // nebula + scroll start in finish(), once nothing is animating
    },
  });
  skipBtn.onclick = () => run.skip();
  await run.done;
  removeEventListener('keydown', onKey);
  finish();

  function finish() {
    if (ended) return;
    ended = true;
    try { sessionStorage.setItem('introSeen', '1'); } catch {}
    revealSite();
    skipBtn.hidden = true;
    root.classList.remove('intro-active', 'intro-landing');
    page.forEach((el) => (el.style.willChange = ''));
    stage.innerHTML = '';
    stage.classList.remove('is-rendering');
    gsap.set(stage, { clearProps: 'all' });
  }
}

/** Make the page visible and interactive (cheap; safe to call mid-animation). */
function showPage() {
  page.forEach((el) => (el.inert = false));
  root.classList.remove('intro-pending');
}

/** Show the page and start the "Beyond" layer (nebula + scroll). Idempotent. */
function revealSite() {
  if (siteReady) return;
  siteReady = true;
  showPage();
  // Heavier set-up (WebGL context, shader compile, ScrollTrigger layout reads) runs only once
  // nothing is animating, so it can never cause a hitch in the intro.
  startNebula().then((nebula) => {
    initScroll({ nebula, reducedMotion: caps.reducedMotion });
    initTilt();
  });
}

async function startNebula() {
  // No WebGL2, or WebGL emulated on the CPU (software renderer): the static CSS gradient stays.
  if (!caps.webgl2 || caps.software) return null;
  try {
    const { NebulaBackground } = await import('./beyond/NebulaBackground.js');
    const s = TIER_SETTINGS[caps.tier] ?? TIER_SETTINGS.low;
    const css = getComputedStyle(root);
    const tints = Object.fromEntries(['a', 'b', 'c', 'd'].map((k) => [k, css.getPropertyValue(`--bg-tint-${k}`).trim()]));
    const n = new NebulaBackground(document.getElementById('nebula'), {
      scale: s.nebulaScale,
      dust: caps.coarse ? 50 : s.dust,
      // Low tier & reduced motion: frozen mist; only the hue shift remains.
      animate: !caps.reducedMotion && (caps.tier === 'high' || caps.tier === 'medium'),
      tints,
    });
    n.start();
    return n;
  } catch (err) {
    console.info('Nebula disabled, using static background:', err.message);
    return null;
  }
}
