import { NOISE_GLSL } from './noise.glsl';

/** Converts an equirectangular uv into a unit sphere direction so noise is seamless. */
const SPHERE_DIR = /* glsl */ `
vec3 sphereDir(vec2 uv) {
  float lon = (uv.x - 0.5) * 6.28318530718;
  float lat = (uv.y - 0.5) * 3.14159265359;
  return vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));
}
`;

/** Banded gas giant with turbulent flow and a single large storm. */
export const GAS_GIANT_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uSeed;
${NOISE_GLSL}
${SPHERE_DIR}
void main() {
  vec3 d = sphereDir(vUv);
  vec3 p = d * 2.2 + vec3(uSeed);
  float turbulence = fbm(p * 1.6, 5);
  float flow = fbm(vec3(p.x * 0.6, p.y * 4.0 + turbulence * 1.4, p.z * 0.6), 4);
  float band = sin(vUv.y * 32.0 + flow * 5.0 + turbulence * 2.0);
  float band2 = sin(vUv.y * 9.0 - flow * 2.0);
  float t = smoothstep(-1.0, 1.0, band) * 0.6 + smoothstep(-1.0, 1.0, band2) * 0.4;
  vec3 color = mix(uColorA, uColorB, t);
  color = mix(color, uColorC, smoothstep(0.45, 0.9, fbm(p * 3.0 + 7.0, 4) * 0.5 + 0.5) * 0.45);
  // Great storm
  vec2 stormCenter = vec2(0.68, 0.36);
  vec2 sd = (vUv - stormCenter) * vec2(1.0, 2.4);
  float storm = exp(-dot(sd, sd) * 120.0);
  float swirl = fbm(vec3(sd * 30.0, uSeed), 3);
  color = mix(color, uColorD, storm * (0.7 + 0.3 * swirl));
  // Fine detail
  color *= 0.92 + 0.08 * fbm(p * 12.0, 3);
  gl_FragColor = vec4(color, 1.0);
}
`;

/** Icy, fractured world used for the archive planet. */
export const ICE_PLANET_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSeed;
${NOISE_GLSL}
${SPHERE_DIR}
void main() {
  vec3 d = sphereDir(vUv);
  vec3 p = d * 3.0 + vec3(uSeed);
  float continents = fbm(p * 1.2, 5) * 0.5 + 0.5;
  float cracks = ridged(p * 4.0, 5);
  float frost = fbm(p * 9.0 + 3.0, 3) * 0.5 + 0.5;
  vec3 color = mix(uColorA, uColorB, smoothstep(0.35, 0.7, continents));
  color = mix(color, uColorC, smoothstep(0.75, 1.0, cracks) * 0.8);
  color = mix(color, vec3(0.93, 0.97, 1.0), smoothstep(0.6, 0.95, frost) * 0.35);
  // Polar caps
  float polar = smoothstep(0.78, 0.98, abs(d.y));
  color = mix(color, vec3(0.95, 0.98, 1.0), polar);
  gl_FragColor = vec4(color, 1.0);
}
`;

/** Dusty rock used for asteroids / the project core moon. */
export const ROCK_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSeed;
${NOISE_GLSL}
${SPHERE_DIR}
void main() {
  vec3 d = sphereDir(vUv);
  vec3 p = d * 4.0 + vec3(uSeed);
  float base = fbm(p, 5) * 0.5 + 0.5;
  float craters = ridged(p * 2.5, 4);
  vec3 color = mix(uColorA, uColorB, base);
  color *= 0.75 + 0.35 * craters;
  color *= 0.9 + 0.1 * fbm(p * 14.0, 3);
  gl_FragColor = vec4(color, 1.0);
}
`;

/** Atmospheric rim glow: fresnel falloff tinted by sunlight direction. */
export const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const ATMOSPHERE_FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vWorldPos;
uniform vec3 uColor;
uniform vec3 uSunDir;
uniform float uPower;
uniform float uIntensity;
void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), uPower);
  float light = clamp(dot(vNormal, uSunDir) * 0.6 + 0.5, 0.05, 1.0);
  float alpha = rim * light * uIntensity;
  gl_FragColor = vec4(uColor * light, alpha);
}
`;

/** Planetary rings with radial density bands and the planet's shadow. */
export const RING_VERTEX = /* glsl */ `
varying vec3 vWorldPos;
varying vec2 vUv;
varying vec3 vLocal;
void main() {
  vUv = uv;
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const RING_FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vWorldPos;
varying vec3 vLocal;
uniform float uInner;
uniform float uOuter;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uSunDir;
uniform vec3 uPlanetPos;
uniform float uPlanetRadius;
uniform float uSeed;
${NOISE_GLSL}

float shadow(vec3 pos) {
  // Ray from fragment towards sun; does it hit the planet sphere?
  vec3 oc = pos - uPlanetPos;
  float b = dot(oc, uSunDir);
  float c = dot(oc, oc) - uPlanetRadius * uPlanetRadius;
  float h = b * b - c;
  if (h < 0.0) return 1.0;
  float t = -b - sqrt(h);
  return t > 0.0 ? 0.0 : 1.0;
}

void main() {
  float r = length(vLocal.xy);
  float t = (r - uInner) / (uOuter - uInner);
  if (t < 0.0 || t > 1.0) discard;
  float bands = fbm(vec3(t * 18.0, uSeed, 0.0), 4) * 0.5 + 0.5;
  float fine = snoise(vec3(t * 140.0, uSeed * 2.0, 1.0)) * 0.5 + 0.5;
  float density = smoothstep(0.2, 0.8, bands) * (0.7 + 0.3 * fine);
  // Cassini-like gap
  density *= 1.0 - smoothstep(0.55, 0.58, t) * (1.0 - smoothstep(0.63, 0.66, t));
  float edge = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.9, 1.0, t));
  float alpha = density * edge;
  float s = shadow(vWorldPos);
  float light = mix(0.08, 1.0, s);
  vec3 color = mix(uColorA, uColorB, bands) * light;
  gl_FragColor = vec4(color, alpha * 0.9);
}
`;
