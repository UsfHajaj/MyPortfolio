export const HOLO_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Holographic project screen. Shows a screenshot (cover-fitted) with scanlines
 * and a cool tint; without a texture it renders an animated data grid.
 */
export const HOLO_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uHasMap;
uniform float uTime;
uniform float uOpacity;
uniform float uAspect;      // texture aspect (w/h)
uniform float uPanelAspect; // panel aspect (w/h)
uniform vec3 uTint;
uniform float uActive;

void main() {
  // Cover-fit uv
  vec2 uv = vUv;
  float ratio = uAspect / uPanelAspect;
  if (ratio > 1.0) {
    uv.x = (uv.x - 0.5) / ratio + 0.5;
  } else {
    uv.y = (uv.y - 0.5) * ratio + 0.5;
  }
  // Show the top of tall screenshots (headers are the recognisable part)
  if (ratio < 1.0) uv.y = uv.y + (1.0 - ratio) * 0.5;

  vec2 edge = smoothstep(0.0, 0.035, vUv) * smoothstep(0.0, 0.035, 1.0 - vUv);
  float vignette = edge.x * edge.y;

  vec3 color;
  float alpha;
  if (uHasMap > 0.5) {
    vec3 tex = texture2D(uMap, uv).rgb;
    float scan = 0.92 + 0.08 * sin(vUv.y * 420.0 - uTime * 3.0);
    color = mix(tex, tex * uTint * 1.4, 0.18) * scan;
    // Horizontal sweep highlight
    float sweep = smoothstep(0.0, 0.08, abs(fract(uTime * 0.12) - vUv.y));
    color += uTint * (1.0 - sweep) * 0.12;
    alpha = uOpacity * vignette;
  } else {
    vec2 grid = abs(fract(vUv * vec2(24.0, 13.5)) - 0.5);
    float lines = smoothstep(0.46, 0.5, max(grid.x, grid.y));
    float bar = smoothstep(0.0, 0.1, abs(fract(uTime * 0.25) - vUv.y));
    color = uTint * (0.25 + lines * 0.6 + (1.0 - bar) * 0.4);
    alpha = uOpacity * vignette * (0.35 + lines * 0.4);
  }
  // Brighter frame glow when active
  float border = 1.0 - min(1.0, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)) / 0.02);
  color += uTint * border * (0.35 + uActive * 0.6);
  gl_FragColor = vec4(color, alpha);
}
`;
