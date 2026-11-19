/**
 * Fixed fullscreen nebula + sparse dust, raw WebGL2 (no three.js, so the main bundle stays small).
 * - Renders at nebulaScale (½ or ¼) resolution; CSS stretches it (it's soft anyway).
 * - Pauses when the tab is hidden. On low tier / reduced motion, time is frozen and we only
 *   redraw when the hue or scroll changes.
 * - Any failure (no context, compile error, context loss) → the canvas hides and the static CSS
 *   gradient underneath remains. Never a blank screen.
 */
import fragSrc from './shaders/nebula.frag.glsl?raw';

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Dust: points in a 0..1 box, wrapped vertically, with per-point depth for scroll parallax.
const DUST_VERT = `#version 300 es
in vec3 aDust;            // x, y in 0..1, z = depth 0..1
uniform float uScroll;
uniform vec2 uResolution;
uniform float uDpr;
out float vAlpha;
void main() {
  float y = fract(aDust.y + uScroll * (0.00004 + aDust.z * 0.00016));
  gl_Position = vec4(aDust.x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
  gl_PointSize = (0.8 + aDust.z * 1.6) * uDpr;
  vAlpha = 0.08 + aDust.z * 0.22;
}`;
const DUST_FRAG = `#version 300 es
precision mediump float;
in float vAlpha;
uniform vec3 uColor;
out vec4 fragColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  fragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.1, d));
}`;

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export class NebulaBackground {
  constructor(canvas, { scale = 0.5, dust = 150, animate = true, tints }) {
    this.canvas = canvas;
    this.scale = scale;
    this.animate = animate;
    this.tints = Object.fromEntries(Object.entries(tints).map(([k, v]) => [k, hexToRgb(v)]));
    this.base = hexToRgb('#F7F6FB');
    this.tint = [...this.tints.a];
    this.tint2 = [...this.tints.b];
    this.target = [...this.tints.a];
    this.target2 = [...this.tints.b];
    this.scroll = scrollY;
    this.time = 0;
    this.running = false;
    this.dirty = true;
    this.dustCount = dust;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) throw new Error('nebula: no WebGL2');
    this.gl = gl;
    this.prog = this.#program(VERT, fragSrc);
    this.dustProg = this.#program(DUST_VERT, DUST_FRAG);

    // Fullscreen triangle.
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    // Dust points (deterministic pseudo-random).
    this.dustVao = gl.createVertexArray();
    gl.bindVertexArray(this.dustVao);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const pts = new Float32Array(dust * 3).map(() => rnd());
    const dbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dbuf);
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
    const dloc = gl.getAttribLocation(this.dustProg, 'aDust');
    gl.enableVertexAttribArray(dloc);
    gl.vertexAttribPointer(dloc, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.u = Object.fromEntries(['uResolution', 'uTime', 'uScroll', 'uTint', 'uTint2', 'uBase'].map((n) => [n, gl.getUniformLocation(this.prog, n)]));
    this.du = Object.fromEntries(['uScroll', 'uResolution', 'uDpr', 'uColor'].map((n) => [n, gl.getUniformLocation(this.dustProg, n)]));

    this.onResize = () => { this.#resize(); this.dirty = true; };
    this.onScroll = () => { this.scroll = scrollY; this.dirty = true; };
    this.onVisibility = () => (document.hidden ? this.stop() : this.start());
    this.onLost = (e) => { e.preventDefault(); this.stop(); this.canvas.classList.remove('is-ready'); this.lost = true; };
    addEventListener('resize', this.onResize, { passive: true });
    addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    canvas.addEventListener('webglcontextlost', this.onLost);
    this.#resize();
  }

  #program(vs, fs) {
    const gl = this.gl;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed');
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link failed');
    return p;
  }

  #resize() {
    const w = Math.max(1, Math.round(innerWidth * this.scale));
    const h = Math.max(1, Math.round(innerHeight * this.scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  /** Set the section tint the mist should drift towards (keys: a/b/c/d). */
  setTint(key, nextKey) {
    if (!this.tints[key]) return;
    this.target = [...this.tints[key]];
    this.target2 = [...(this.tints[nextKey] ?? this.tints[key])];
    this.dirty = true;
  }

  start() {
    if (this.running || this.lost || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      if (this.animate) { this.time += dt; this.dirty = true; }
      // Ease the tint toward its target (~1s settle).
      const k = 1 - Math.pow(0.02, dt);
      let moving = false;
      for (let i = 0; i < 3; i++) {
        const d1 = this.target[i] - this.tint[i];
        const d2 = this.target2[i] - this.tint2[i];
        if (Math.abs(d1) > 1e-4 || Math.abs(d2) > 1e-4) moving = true;
        this.tint[i] += d1 * k;
        this.tint2[i] += d2 * k;
      }
      if (moving) this.dirty = true;
      if (this.dirty) this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  render() {
    const gl = this.gl;
    this.dirty = false;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.prog);
    gl.uniform2f(this.u.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.u.uTime, this.time);
    gl.uniform1f(this.u.uScroll, this.scroll);
    gl.uniform3fv(this.u.uTint, this.tint);
    gl.uniform3fv(this.u.uTint2, this.tint2);
    gl.uniform3fv(this.u.uBase, this.base);
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (this.dustCount) {
      gl.useProgram(this.dustProg);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(this.du.uScroll, this.scroll);
      gl.uniform2f(this.du.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.du.uDpr, Math.max(1, this.scale * 2));
      gl.uniform3f(this.du.uColor, 0.29, 0.25, 0.66);
      gl.bindVertexArray(this.dustVao);
      gl.drawArrays(gl.POINTS, 0, this.dustCount);
    }
    gl.bindVertexArray(null);
    if (!this.canvas.classList.contains('is-ready')) this.canvas.classList.add('is-ready');
  }
}
