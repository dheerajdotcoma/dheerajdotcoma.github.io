#version 300 es
// "Beyond" nebula: a pale, barely-there mist behind the content.
// 3 octaves of value-noise fbm, domain-warped once, very low contrast, drifting slowly
// (one full drift cycle ≈ 80s). Rendered at half/quarter resolution and upscaled by CSS.
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;     // seconds, frozen on low tier / reduced motion
uniform float uScroll;   // page scroll in px (subtle parallax)
uniform vec3 uTint;      // current section tint (lerped on the CPU)
uniform vec3 uTint2;     // secondary tint (the next section's), for gentle variety
uniform vec3 uBase;      // --bg-base

out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.6;
  p.y += uScroll * 0.00012;                    // mist drifts a touch with scroll
  float t = uTime * (6.2831 / 80.0);           // 80s cycle
  vec2 drift = vec2(cos(t), sin(t)) * 0.35;

  vec2 q = vec2(fbm(p + drift), fbm(p + vec2(5.2, 1.3) - drift));
  float n = fbm(p + 1.6 * q);                  // domain warp → soft wisps
  float n2 = fbm(p * 0.7 - q + 3.0);

  // Low contrast: base colour + tinted mist, never darker than the tints themselves.
  vec3 col = uBase;
  col = mix(col, uTint, smoothstep(0.25, 0.85, n) * 0.85);
  col = mix(col, uTint2, smoothstep(0.45, 0.95, n2) * 0.45);
  col += (n - 0.5) * 0.012;                    // whisper of texture
  // Tiny ordered dither to avoid banding on 8-bit displays.
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(col, 1.0);
}
