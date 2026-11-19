/**
 * Device tier detection: 'high' | 'medium' | 'low' | 'none'.
 *
 *   none   → no WebGL2, reduced motion, or a software rasteriser (a stuttering intro is worse than none)
 *   low    → phones/tablets, coarse pointer, small screen, ≤4GB device memory, or a known-weak GPU
 *   medium → integrated desktop GPUs and anything we can't identify
 *   high   → discrete / Apple-silicon class GPUs
 *
 * Dev overrides: ?tier=high|medium|low|none
 */
export const TIERS = ['none', 'low', 'medium', 'high'];

/** Nebula background quality per tier (the intro is plain DOM and runs everywhere). */
export const TIER_SETTINGS = {
  high: { nebulaScale: 0.5, dust: 150 },
  medium: { nebulaScale: 0.5, dust: 150 },
  low: { nebulaScale: 0.25, dust: 50 },
};

let cached = null;

export function detectCapabilities() {
  if (cached) return cached;
  const params = new URLSearchParams(location.search);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 600 || innerWidth < 768;
  const memory = navigator.deviceMemory ?? 8;

  let webgl2 = false;
  let renderer = '';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (gl) {
      webgl2 = true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl2 = false;
  }

  let tier;
  let reason;
  if (!webgl2) [tier, reason] = ['none', 'no WebGL2'];
  else if (reducedMotion) [tier, reason] = ['none', 'prefers-reduced-motion'];
  else if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) [tier, reason] = ['none', 'software renderer'];
  else if (coarse || small || memory <= 4) [tier, reason] = ['low', 'mobile / low-memory device'];
  else if (/mali|adreno|powervr|videocore|intel.*hd graphics [2-5]\d{2}\b/i.test(renderer)) [tier, reason] = ['low', 'weak GPU'];
  else if (/nvidia|geforce|rtx|quadro|radeon (rx|pro)|amd|apple m\d|apple gpu/i.test(renderer)) [tier, reason] = ['high', 'discrete-class GPU'];
  else [tier, reason] = ['medium', 'integrated / unknown GPU'];

  const forced = params.get('tier');
  if (TIERS.includes(forced)) [tier, reason] = [forced, 'forced via ?tier'];

  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  cached = { tier, reason, renderer, webgl2, software, reducedMotion, coarse };
  return cached;
}
