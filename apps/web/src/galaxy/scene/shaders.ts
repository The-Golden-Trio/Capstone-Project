/**
 * GLSL cho cảnh ngân hà. Mọi bề mặt đều sinh bằng noise lúc chạy — repo không
 * có ảnh texture hay model 3D nào, nên không phải lo bản quyền hay quản lý file.
 *
 * Các shader dùng chung một hàm simplex noise 3D (Ashima Arts / Stefan Gustavson,
 * giấy phép MIT) và fbm dựng trên nó.
 */

export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* fbm trả về [0,1]. Số octave cố định theo tham số để GLSL unroll được. */
float fbm(vec3 p, int octaves) {
  float sum = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    sum += amp * snoise(p);
    norm += amp;
    p = p * 2.05 + vec3(17.3, 9.1, 3.7);
    amp *= 0.5;
  }
  return 0.5 + 0.5 * sum / norm;
}
`;

/* ── Hành tinh ─────────────────────────────────────────────────────────── */

export const PLANET_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
void main() {
  vObjPos = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const PLANET_FRAG = /* glsl */ `
${NOISE_GLSL}
uniform vec3 uColorDeep;
uniform vec3 uColorLand;
uniform vec3 uColorBand;
uniform vec3 uColorIce;
uniform vec3 uRimColor;
uniform vec3 uLightPos;
uniform float uSeed;
uniform float uBands;
uniform float uBandFreq;
uniform float uLand;
uniform float uIce;
uniform float uLava;
uniform float uCity;
uniform float uSpec;
uniform float uAmbient;
uniform float uBright;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;

void main() {
  vec3 p = vObjPos + vec3(uSeed * 0.37, uSeed * 0.11, uSeed * 0.23);
  float n1 = fbm(p * 2.0, 5);
  float n2 = fbm(p * 5.0 + 3.7, 4);
  float detail = fbm(p * 12.0 - 2.1, 3);
  float lat = vObjPos.y;

  // dải ngang kiểu Sao Mộc, uốn theo noise cho khỏi thẳng tắp
  float bands = 0.5 + 0.5 * sin(lat * uBandFreq * 3.14159 + (n1 - 0.5) * 3.2 + n2 * 1.4);
  // lục địa: ngưỡng noise; uLand cao → ít đất
  float landMask = smoothstep(uLand - 0.06, uLand + 0.06, n1 * 0.6 + n2 * 0.3 + detail * 0.1);
  vec3 surf = mix(uColorDeep, uColorLand, landMask);
  surf = mix(surf, uColorBand, bands * uBands);
  surf *= 0.85 + detail * 0.3;
  // chỏm băng hai cực, mép nham nhở theo noise
  float capEdge = 1.0 - uIce * 0.5;
  float cap = smoothstep(capEdge - 0.08, capEdge + 0.04, abs(lat) + (n2 - 0.5) * 0.15) * step(0.01, uIce);
  surf = mix(surf, uColorIce, cap);

  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightPos - vWorldPos);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float diff = max(dot(N, L), 0.0);
  // wrap lighting: đường sáng/tối mềm, mặt tối vẫn thấy lờ mờ
  float wrap = max((dot(N, L) + 0.35) / 1.35, 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 42.0) * (1.0 - landMask) * uSpec;
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.2);

  vec3 color = surf * (uAmbient + wrap * 1.15) + spec * 0.55;
  color += uRimColor * rim * (0.28 + 0.6 * wrap);

  // dung nham: vết nứt phát sáng, đập nhẹ theo thời gian
  float cracks = smoothstep(0.6, 0.72, fbm(p * 7.0 + 11.0, 4)) * uLava;
  color += vec3(1.0, 0.42, 0.1) * cracks * (1.5 + 0.4 * sin(uTime * 1.3 + uSeed));

  // đèn thành phố ở mặt đêm, chỉ trên đất liền
  float night = 1.0 - smoothstep(0.0, 0.25, diff);
  float cities = smoothstep(0.62, 0.86, detail) * landMask * night * uCity;
  color += vec3(1.0, 0.82, 0.5) * cities * 1.3;

  // hành tinh xa vùng đang đứng thì tối đi, mắt tự dồn vào vùng gần
  color = mix(color * 0.32, color, uBright);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── Khí quyển (vẽ mặt sau của một cầu lớn hơn, cộng màu) ─────────────── */

export const ATMO_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uCoef;
uniform float uPower;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  float a = pow(max(uCoef + dot(vNormal, vViewDir), 0.0), uPower);
  gl_FragColor = vec4(uColor * a * uOpacity, a * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── Vành đai ──────────────────────────────────────────────────────────── */

export const RING_VERT = /* glsl */ `
varying float vR;
void main() {
  vR = length(position.xy);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const RING_FRAG = /* glsl */ `
${NOISE_GLSL}
uniform vec3 uColor;
uniform float uInner;
uniform float uOuter;
uniform float uSeed;
uniform float uOpacity;
varying float vR;
void main() {
  float t = clamp((vR - uInner) / (uOuter - uInner), 0.0, 1.0);
  float grain = snoise(vec3(t * 26.0, uSeed, 0.0)) * 0.5 + 0.5;
  float stripes = 0.35 + 0.65 * smoothstep(0.25, 0.75, fract(t * 7.0 + grain * 0.6));
  float edge = sin(t * 3.14159);
  float gap = smoothstep(0.42, 0.46, abs(t - 0.58)); // khe Cassini
  float a = stripes * edge * (0.55 + 0.45 * grain) * gap * uOpacity;
  gl_FragColor = vec4(uColor * (0.7 + 0.5 * grain), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── Sao nền & bụi ─────────────────────────────────────────────────────── */

export const STARS_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
uniform float uAttenuate;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.7 + 0.3 * sin(uTime * 1.7 + aPhase);
  vTwinkle = tw;
  float att = mix(1.0, clamp(320.0 / -mv.z, 0.2, 4.0), uAttenuate);
  gl_PointSize = aSize * uPixelRatio * att * tw;
  gl_Position = projectionMatrix * mv;
}
`;

export const STARS_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, d), 1.9);
  gl_FragColor = vec4(vColor, a * vTwinkle * uOpacity);
  #include <colorspace_fragment>
}
`;

/* ── Tinh vân (mặt trong của một cầu rất lớn) ──────────────────────────── */

export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SKY_FRAG = /* glsl */ `
${NOISE_GLSL}
uniform float uIntensity;
uniform float uTime;
varying vec3 vDir;
void main() {
  vec3 d = vDir;
  float n = fbm(d * 2.3 + vec3(4.2, 1.1, 7.7), 5);
  float n2 = fbm(d * 5.1 + vec3(2.0, 8.3, 0.4) + uTime * 0.004, 4);
  // dải Ngân Hà: một vành mờ nghiêng, dày ở giữa
  float band = exp(-pow(dot(d, normalize(vec3(0.25, 1.0, 0.18))), 2.0) * 9.0);

  vec3 deepBlue = vec3(0.08, 0.14, 0.38);
  vec3 violet   = vec3(0.26, 0.12, 0.44);
  vec3 teal     = vec3(0.04, 0.34, 0.40);
  vec3 gold     = vec3(0.70, 0.55, 0.30);

  vec3 col = mix(deepBlue, violet, smoothstep(0.35, 0.78, n));
  col = mix(col, teal, smoothstep(0.58, 0.88, n2) * 0.55);
  float dens = smoothstep(0.44, 0.82, n) * 0.5 + band * smoothstep(0.3, 0.7, n2) * 0.75;
  col = mix(col, gold, band * smoothstep(0.62, 0.92, n2) * 0.55);

  vec3 base = vec3(0.012, 0.018, 0.048);
  gl_FragColor = vec4(base + col * dens * uIntensity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── Quầng sáng của mặt trời (sprite) ──────────────────────────────────── */

export const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const GLOW_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float core = smoothstep(0.22, 0.0, d);
  float halo = pow(max(1.0 - d, 0.0), 2.6);
  vec3 col = mix(uColor, vec3(1.0), core * 0.85) * (core * 2.2 + halo) * uIntensity;
  gl_FragColor = vec4(col, (core + halo * 0.9));
  #include <colorspace_fragment>
}
`;
