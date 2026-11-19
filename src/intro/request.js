/**
 * Intro: "request → response".
 *
 *   TYPE      a terminal settles in; `GET /portfolio` types out.
 *   LAUNCH    enter: the terminal recoils, the request shoots off into the distance, the screen jolts.
 *   TRANSIT   warp-speed streaks accelerate outward, the camera rumbles harder and harder, network
 *             hops fly past the viewer, latency ticks up.
 *   ARRIVAL   hard stop: streaks snap off, flash, heavy shake, "200 OK" slams in.
 *   RESPONSE  headers stream in (from src/data/content.js), then the body with the name.
 *   RENDER    the response drifts away, the page is revealed through a soft circle opening from
 *             the name, and the name glides into the hero heading.
 *
 * DOM + 2D canvas + GSAP. One clock (performance.now) drives everything. All timings in BEATS.
 */
import { gsap } from 'gsap';

export const BEATS = {
  termIn: 0.0,        // terminal settles in
  typeStart: 0.4,
  charGap: 0.045,     // typing speed (s per character)
  enter: 1.15,        // request sent
  transit: 1.3,       // warp begins
  arrive: 2.8,        // hard stop + 200 OK
  headers: 3.1,       // first header line
  headerGap: 0.11,
  body: 3.75,         // response body
  render: 4.15,       // stage zooms away, name flies to the hero
  renderDur: 1.05,   // calm hand-off: soft circular reveal + name glides into the hero
  hops: ['dns', 'edge', 'gateway', 'auth · rbac', 'service'],
};

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Decaying random shake, as a timeline you can drop into another timeline. */
function shake(targets, { amp = 14, dur = 0.5, freq = 30, rot = 0.6, seed = 1 } = {}) {
  let s = seed * 9973;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const tl = gsap.timeline();
  const n = Math.max(2, Math.round(dur * freq));
  for (let i = 0; i < n; i++) {
    const k = Math.pow(1 - i / n, 1.6); // decay
    tl.to(targets, { x: r() * amp * k, y: r() * amp * k * 0.8, rotation: r() * rot * k, duration: 1 / freq, ease: 'none' });
  }
  tl.to(targets, { x: 0, y: 0, rotation: 0, duration: 0.08, ease: 'power1.out' });
  return tl;
}

export function mountRequest(stage, { name, hero, intro, experience }) {
  const role = intro.tags[0] ?? hero.role;
  const focus = intro.tags.filter((t) => !/perficient/i.test(t) && t !== role).map((t) => t.toLowerCase().replace(/\s*&\s*/g, ', ')).join(', ');
  const headers = [
    ['role', role],
    ['org', experience[0]?.org],
    ['focus', focus],
    ['location', hero.location],
    ['content-type', 'portfolio/html'],
  ].filter(([, v]) => v);

  stage.innerHTML = `
    <canvas class="rq-warp" aria-hidden="true"></canvas>
    <div class="rq-cam" aria-hidden="true">
      <div class="rq-term">
        <div class="rq-bar"><i></i><i></i><i></i><span>request</span></div>
        <div class="rq-screen">
          <p class="rq-line rq-cmd"><span class="rq-prompt">$</span> <span class="rq-typed"></span><span class="rq-caret"></span></p>
        </div>
      </div>
      <div class="rq-packet">GET /portfolio</div>
      ${BEATS.hops.map((h) => `<div class="rq-hop">${esc(h)}</div>`).join('')}
      <div class="rq-latency"><span>latency</span> <b>0</b> ms</div>
      <div class="rq-response">
        <p class="rq-status"><span class="rq-proto">HTTP/2</span> <span class="rq-ok"><b>200 OK</b><b class="rq-ch rq-ch-r">200 OK</b><b class="rq-ch rq-ch-b">200 OK</b></span></p>
        <ul class="rq-headers">
          ${headers.map(([k, v]) => `<li><span class="rq-k">${esc(k)}:</span> ${esc(v)}</li>`).join('')}
        </ul>
        <p class="rq-body"><span class="rq-brace">{</span> <span class="rq-k">"name"</span>: <span class="rq-q">"</span><span class="rq-name">${esc(name)}</span><span class="rq-q">"</span> <span class="rq-brace">}</span></p>
      </div>
    </div>
    <div class="rq-flash" aria-hidden="true"></div>
`;
  const ready = Promise.all([
    document.fonts?.load('650 100px "Space Grotesk"'),
    document.fonts?.load('500 16px "Space Grotesk"'),
  ]);
  return { ready, play: (opts) => play(stage, opts) };
}

/** @returns {{ done: Promise<void>, skip: () => void }} */
function play(stage, { heroHeading, pageEls, onReveal }) {
  const B = BEATS;
  const $ = (s) => stage.querySelector(s);
  const cam = $('.rq-cam');
  const term = $('.rq-term');
  const typed = $('.rq-typed');
  const caret = $('.rq-caret');
  const packet = $('.rq-packet');
  const hops = [...stage.querySelectorAll('.rq-hop')];
  const latency = $('.rq-latency');
  const latencyN = $('.rq-latency b');
  const response = $('.rq-response');
  const status = $('.rq-status');
  const headerLines = [...stage.querySelectorAll('.rq-headers li')];
  const body = $('.rq-body');
  const nameEl = $('.rq-name');
  const flash = $('.rq-flash');
  const canvas = $('.rq-warp');

  // ── Warp field (canvas): streaks rushing outward from the centre.
  const W = innerWidth;
  const H = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const N = W < 640 ? 160 : 300;
  let seed = 4242;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const stars = Array.from({ length: N }, () => ({ a: rnd() * Math.PI * 2, z: rnd(), warm: rnd() < 0.12, w: 0.6 + rnd() * 1.4 }));
  const state = { warp: 0, glow: 0, rumble: 0, idle: 0.04 }; // warp: 0..1 speed, rumble: camera shake amount

  const cx = W / 2;
  const cy = H / 2;
  const reach = Math.hypot(W, H) / 2;
  function drawWarp(dt) {
    ctx.clearRect(0, 0, W, H);
    // Centre glow grows with speed.
    if (state.glow > 0.001) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.6);
      g.addColorStop(0, `rgba(150, 135, 255, ${0.28 * state.glow})`);
      g.addColorStop(1, 'rgba(150, 135, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    const speed = state.idle + state.warp * 2.6; // depth units per second
    for (const s of stars) {
      s.z -= speed * dt;
      if (s.z <= 0.02) { s.z += 1; s.a = rnd() * Math.PI * 2; }
      const r1 = (0.06 / s.z) * reach;                       // perspective: 1/z
      const r0 = (0.06 / Math.min(1, s.z + speed * 0.045)) * reach; // tail = where it was a moment ago
      if (r0 > reach * 1.2) continue;
      const cos = Math.cos(s.a);
      const sin = Math.sin(s.a);
      const alpha = Math.min(1, (1 - s.z) * 1.4) * (0.25 + 0.75 * Math.min(1, state.warp * 1.5 + 0.2));
      ctx.strokeStyle = s.warm ? `rgba(255, 196, 140, ${alpha})` : `rgba(214, 208, 255, ${alpha})`;
      ctx.lineWidth = s.w * (0.6 + (1 - s.z));
      ctx.beginPath();
      ctx.moveTo(cx + cos * r0, cy + sin * r0);
      ctx.lineTo(cx + cos * Math.max(r1, r0 + 0.8), cy + sin * Math.max(r1, r0 + 0.8));
      ctx.stroke();
    }
  }

  // Text box of a node (Ranges measure the TEXT; the <h1> element itself is a full-width block).
  const textBox = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
  // Where the name must land, measured now, before any transform touches the page.
  const landBox = textBox(heroHeading);
  const landFs = parseFloat(getComputedStyle(heroHeading).fontSize);
  const landColor = getComputedStyle(heroHeading).color;

  // ── Master timeline (paused; advanced by the frame loop below).
  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));
  const tl = gsap.timeline({ paused: true, onComplete: () => { stop(); resolveDone(); } });
  const reqText = 'GET /portfolio';

  // TYPE
  tl.fromTo(term, { opacity: 0, scale: 0.94, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }, B.termIn);
  [...reqText].forEach((_, i) => tl.call(() => { typed.textContent = reqText.slice(0, i + 1); }, null, B.typeStart + i * B.charGap));

  // LAUNCH
  tl.call(() => caret.classList.add('is-sent'), null, B.enter);
  tl.to(term, { scale: 0.965, duration: 0.07, ease: 'power2.out' }, B.enter);
  tl.to(term, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, B.enter + 0.07);
  tl.add(shake(cam, { amp: 7, dur: 0.28, seed: 2 }), B.enter + 0.02);
  tl.call(() => {
    // Launch from exactly where the command was typed.
    const r = textBox(typed);
    Object.assign(packet.style, { left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px` });
  }, null, B.enter);
  tl.fromTo(packet, { opacity: 0, scale: 1, y: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, B.enter + 0.05);
  // Shoots toward the vanishing point at the centre of the screen.
  tl.to(packet, { scale: 0.04, left: W / 2, top: H / 2, opacity: 0, duration: 0.55, ease: 'power3.in' }, B.enter + 0.1);
  tl.to(term, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'power2.in' }, B.transit - 0.05);

  // TRANSIT: speed builds, the camera rumbles, hops fly past, latency ticks.
  const T = B.arrive - B.transit;
  tl.to(state, { warp: 1, glow: 1, duration: T * 0.85, ease: 'power2.in' }, B.transit);
  tl.to(state, { rumble: 1, duration: T, ease: 'power2.in' }, B.transit);
  tl.fromTo(latency, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }, B.transit + 0.1);
  const lat = { v: 0 };
  tl.to(lat, { v: 87, duration: T, ease: 'power1.in', onUpdate: () => { latencyN.textContent = String(Math.round(lat.v)); } }, B.transit);
  hops.forEach((h, i) => {
    const at = B.transit + 0.15 + (i * (T - 0.45)) / Math.max(1, hops.length - 1);
    const ang = ((i * 137.5) % 360) * (Math.PI / 180);
    const dx = Math.cos(ang) * Math.min(W, 900) * 0.42;
    const dy = Math.sin(ang) * Math.min(H, 700) * 0.36;
    tl.fromTo(h, { opacity: 0, scale: 0.25, x: dx * 0.15, y: dy * 0.15 },
      { opacity: 1, scale: 1, x: dx * 0.55, y: dy * 0.55, duration: 0.22, ease: 'power1.in' }, at);
    tl.to(h, { opacity: 0, scale: 3.2, x: dx * 1.6, y: dy * 1.6, duration: 0.2, ease: 'power2.in' }, at + 0.22);
  });

  // ARRIVAL: hard stop.
  tl.to(state, { warp: 0, glow: 0, rumble: 0, duration: 0.16, ease: 'power3.out' }, B.arrive);
  tl.to(latency, { opacity: 0, duration: 0.15 }, B.arrive);
  tl.fromTo(flash, { opacity: 0.65 }, { opacity: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, B.arrive);
  tl.set(response, { opacity: 1 }, B.arrive);
  tl.fromTo(status, { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: 'expo.out' }, B.arrive);
  // Impact: the colour channels split apart and snap back together (two coloured copies that
  // only move, so it stays on the compositor instead of repainting a text-shadow every frame).
  tl.fromTo(stage.querySelector('.rq-ch-r'), { x: -14, opacity: 0.9 }, { x: 0, opacity: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, B.arrive + 0.04);
  tl.fromTo(stage.querySelector('.rq-ch-b'), { x: 14, opacity: 0.9 }, { x: 0, opacity: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, B.arrive + 0.04);
  tl.add(shake(cam, { amp: 22, dur: 0.55, seed: 3, rot: 1.1 }), B.arrive + 0.04);

  // RESPONSE
  headerLines.forEach((li, i) => {
    tl.fromTo(li, { opacity: 0, x: 70 }, { opacity: 1, x: 0, duration: 0.28, ease: 'power3.out' }, B.headers + i * B.headerGap);
  });
  tl.fromTo(body, { opacity: 0, x: 70 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }, B.body);
  tl.fromTo(nameEl, { color: '#F7F6FB' }, { color: '#FFD9A8', duration: 0.25, yoyo: true, repeat: 1 }, B.body + 0.25);

  // RENDER: a calm hand-off. The response lines drift away, the page is revealed through a
  // soft-edged circle that opens outward from the name, and the name glides into the hero heading.
  // The name flies OUTSIDE the stage, so the reveal mask never clips it.
  const flyer = document.createElement('span');
  flyer.className = 'rq-flyer';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.textContent = nameEl.textContent;
  document.body.appendChild(flyer);
  const flight = {};
  const soft = Math.max(W, H) * 0.22;                       // feather of the reveal edge
  // Measure once the body line has settled (well before the render beat), so the render frame
  // itself only flips styles.
  tl.call(() => {
    const from = textBox(nameEl);
    const fs = parseFloat(getComputedStyle(nameEl).fontSize);
    const cxName = from.left + from.width / 2;
    const cyName = from.top + from.height / 2;
    Object.assign(flight, {
      dx: landBox.left + landBox.width / 2 - cxName,
      dy: landBox.top + landBox.height / 2 - cyName,
      s: landFs / fs,
      ready: true,
    });
    Object.assign(flyer.style, { left: `${cxName}px`, top: `${cyName}px`, fontSize: `${fs}px` });
    // The reveal circle opens from the name's position and grows past the farthest corner.
    flight.far = Math.max(Math.hypot(cxName, cyName), Math.hypot(W - cxName, cyName), Math.hypot(cxName, H - cyName), Math.hypot(W - cxName, H - cyName));
    gsap.set(stage, { '--rx': `${cxName}px`, '--ry': `${cyName}px`, '--soft': `${soft}px`, '--reveal': `${-soft}px` });
  }, null, B.body + 0.35);
  tl.call(() => {
    flyer.style.visibility = 'visible';
    nameEl.style.visibility = 'hidden';
    stage.classList.add('is-rendering');
    onReveal?.();
  }, null, B.render);

  // Everything but the name drifts up and fades.
  const leaving = [status, ...headerLines, ...body.querySelectorAll('.rq-brace, .rq-k, .rq-q'), latency];
  tl.to(leaving, { opacity: 0, y: -14, duration: 0.45, ease: 'power2.inOut', stagger: 0.025 }, B.render);
  // Soft circular reveal of the page.
  const reveal = { r: 0 };
  tl.fromTo(reveal, { r: 0 }, {
    r: 1, duration: B.renderDur, ease: 'power2.inOut', immediateRender: false,
    onUpdate: () => { if (flight.far) stage.style.setProperty('--reveal', `${-soft + (flight.far + soft) * reveal.r}px`); },
  }, B.render + 0.12);
  // The page settles very slightly as it appears (no bounce, no shake).
  tl.fromTo(pageEls, { scale: 1.015, transformOrigin: '50% 30%' }, { scale: 1, duration: B.renderDur + 0.2, ease: 'power2.out', immediateRender: false }, B.render + 0.12);
  // The name glides into place and takes on the page's ink colour.
  const fly = { k: 0 };
  tl.to(fly, {
    k: 1, duration: B.renderDur, ease: 'power2.inOut',
    onUpdate: () => {
      if (!flight.ready) return;
      const k = fly.k;
      const sc = 1 + (flight.s - 1) * k;
      flyer.style.transform = `translate(-50%, -50%) translate(${flight.dx * k}px, ${flight.dy * k}px) scale(${sc})`;
    },
  }, B.render + 0.08);
  tl.fromTo(flyer, { color: '#F7F6FB' }, { color: landColor, duration: 0.6, ease: 'power1.inOut', immediateRender: false }, B.render + 0.15);
  const land = B.render + 0.08 + B.renderDur;
  tl.call(() => { flyer.remove(); onReveal?.({ landed: true }); }, null, land);
  tl.set(pageEls, { clearProps: 'transform' }, B.render + 0.32 + B.renderDur);

  // ── Frame loop: one clock for canvas + timeline + camera rumble.
  let t0 = null;
  let last = 0;
  let raf = 0;
  let stopped = false;
  const frame = () => {
    if (stopped) return;
    const now = performance.now();
    if (t0 === null) { t0 = now; last = now; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    drawWarp(dt);
    tl.time(Math.min(t, tl.duration()));
    if (state.rumble > 0.001) {
      // High-speed vibration on top of the timeline's own transforms.
      const a = state.rumble * 6;
      const jx = `${((Math.random() - 0.5) * a).toFixed(1)}px ${((Math.random() - 0.5) * a).toFixed(1)}px`;
      canvas.style.translate = jx;
      cam.style.translate = jx; // CSS translate composes with the timeline's transforms
    } else if (canvas.style.translate) { canvas.style.translate = ''; cam.style.translate = ''; }
    if (!stopped) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  function stop() {
    stopped = true;
    cancelAnimationFrame(raf);
  }

  return {
    done,
    duration: tl.duration(),
    skip() {
      if (stopped) return;
      stop();
      tl.kill();
      gsap.set(pageEls, { clearProps: 'transform' });
      flyer.remove();
      onReveal?.({ skipped: true });
      gsap.to(stage, { opacity: 0, duration: 0.35, ease: 'power1.out', onComplete: resolveDone });
    },
  };
}
