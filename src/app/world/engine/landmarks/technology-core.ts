import * as THREE from 'three';
import { SkillCategory } from '../../../data/portfolio.data';
import { createGlowTexture } from '../bake';
import { DestinationId } from '../destinations';
import { Interactable } from '../interaction';
import { NOISE_GLSL } from '../shaders/noise.glsl';
import { HOLO_VERTEX } from '../shaders/holo.glsl';
import { damp } from '../tween';
import { emissive, metal, Palette } from '../world-object';
import { Landmark, LandmarkEvents, SubLabel } from './landmark';

const CORE_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocal;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const CORE_FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocal;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
${NOISE_GLSL}
void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.2);
  float n = fbm(vLocal * 0.9 + vec3(0.0, uTime * 0.15, uTime * 0.08), 4) * 0.5 + 0.5;
  float veins = smoothstep(0.55, 0.9, n);
  vec3 color = mix(uColorA, uColorB, n) * (0.35 + veins * 1.4);
  color += uColorB * fresnel * 1.6;
  gl_FragColor = vec4(color, 1.0);
}
`;

const COIN_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uHasMap;
uniform vec3 uColor;
uniform float uGlow;
uniform float uOpacity;
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p);
  if (r > 0.5) discard;
  float ring = smoothstep(0.40, 0.44, r) * (1.0 - smoothstep(0.47, 0.5, r));
  float inner = 1.0 - smoothstep(0.38, 0.42, r);
  vec3 color;
  float alpha;
  if (uHasMap > 0.5) {
    vec2 uv = (vUv - 0.5) * 1.25 + 0.5;
    vec4 tex = texture2D(uMap, clamp(uv, 0.0, 1.0));
    color = mix(vec3(0.05, 0.08, 0.16), tex.rgb, tex.a) * inner;
    alpha = inner * uOpacity;
  } else {
    color = uColor * 0.35 * inner;
    alpha = inner * uOpacity * 0.7;
  }
  color += uColor * ring * (0.8 + uGlow * 1.6);
  alpha = max(alpha, ring * uOpacity);
  gl_FragColor = vec4(color, alpha);
}
`;

interface Node {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  categoryIndex: number;
  skillIndex: number;
  angle: number;
  radius: number;
  scale: number;
}

interface Shell {
  group: THREE.Group;
  ring: THREE.Mesh;
  ringMaterial: THREE.MeshStandardMaterial;
  speed: number;
}

/**
 * Technology Core Vega — the Skills location. A pulsing energy core with four
 * inclined orbital shells; each shell is a skill category whose technologies
 * orbit as holographic coins.
 */
export class TechnologyCore extends Landmark {
  readonly destinationId: DestinationId = 'skills';

  private coreMaterial: THREE.ShaderMaterial;
  private shells: Shell[] = [];
  private nodes: Node[] = [];
  private activeCategory = 0;
  private hoveredNode: Node | null = null;
  private isAtDestination = () => false;
  private loader = new THREE.TextureLoader();
  private preloaded = false;
  private glowTexture: THREE.Texture;
  private glow: THREE.Sprite;
  private coinGeometry = new THREE.PlaneGeometry(1, 1);
  private tmpCamera = new THREE.Vector3();

  constructor(private readonly categories: SkillCategory[], private readonly events: LandmarkEvents) {
    super();
    this.labelOffset.set(0, 11.5, 0);

    this.coreMaterial = new THREE.ShaderMaterial({
      vertexShader: CORE_VERTEX,
      fragmentShader: CORE_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x1a2a6a) },
        uColorB: { value: new THREE.Color(0x5fb7ff) },
      },
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(2.2, 64, 48), this.coreMaterial);
    this.add(core);

    // Containment cage
    const cage = metal(Palette.hullMid, 0.45, 0.8);
    for (let i = 0; i < 3; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.07, 8, 72), cage);
      band.rotation.set(Math.PI / 2 * (i === 0 ? 1 : 0), (i * Math.PI) / 3, i === 2 ? Math.PI / 2 : 0);
      this.add(band);
    }
    const trim = this.trackGlow(emissive(Palette.accentCyan, 1.2, 0x0a1a24));
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.4, 0.25), cage);
      pylon.position.set(Math.cos(angle) * 3.2, 0, Math.sin(angle) * 3.2);
      pylon.lookAt(0, 0, 0);
      this.add(pylon);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), trim);
      tip.position.copy(pylon.position).multiplyScalar(1.12);
      this.add(tip);
    }

    this.glowTexture = createGlowTexture(128, [110, 190, 255]);
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTexture, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.glow.scale.setScalar(12);
    this.add(this.glow);
    const coreLight = new THREE.PointLight(0x6fb6ff, 40, 40, 2);
    this.add(coreLight);

    // Orbital shells
    const radii = [4.6, 6.3, 8.0, 9.7];
    const tilts: Array<[number, number]> = [
      [0.35, 0.0],
      [-0.55, 0.6],
      [0.9, -0.4],
      [-0.25, 1.4],
    ];
    categories.forEach((category, c) => {
      const color = new THREE.Color(category.color);
      const group = new THREE.Group();
      group.rotation.set(tilts[c][0], tilts[c][1], 0);
      const ringMaterial = emissive(color.getHex(), 0.5, 0x05070f);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radii[c], 0.022, 6, 160), ringMaterial);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      this.add(group);
      const speed = (0.08 + c * 0.025) * (c % 2 === 0 ? 1 : -1);
      this.shells.push({ group, ring, ringMaterial, speed });

      category.skills.forEach((skill, s) => {
        const material = new THREE.ShaderMaterial({
          vertexShader: HOLO_VERTEX,
          fragmentShader: COIN_FRAGMENT,
          uniforms: {
            uMap: { value: null },
            uHasMap: { value: 0 },
            uColor: { value: color },
            uGlow: { value: 0 },
            uOpacity: { value: 0.6 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(this.coinGeometry, material);
        mesh.scale.setScalar(1.25);
        const angle = (s / category.skills.length) * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * radii[c], 0, Math.sin(angle) * radii[c]);
        group.add(mesh);
        this.nodes.push({ mesh, material, categoryIndex: c, skillIndex: s, angle, radius: radii[c], scale: 1.25 });
      });
    });

    this.setActiveCategory(0);
  }

  setDestinationCheck(check: () => boolean): void {
    this.isAtDestination = check;
  }

  setActiveCategory(index: number): void {
    this.activeCategory = index;
  }

  override preload(): void {
    if (this.preloaded) return;
    this.preloaded = true;
    for (const node of this.nodes) {
      const skill = this.categories[node.categoryIndex].skills[node.skillIndex];
      this.loader.load(skill.icon, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        node.material.uniforms['uMap'].value = texture;
        node.material.uniforms['uHasMap'].value = 1;
      });
    }
  }

  override getInteractables(): Interactable[] {
    return this.nodes.map((node) => ({
      id: `skill:${node.categoryIndex}:${node.skillIndex}`,
      object: node.mesh,
      isActive: () => this.isAtDestination(),
      onHover: (hovered) => {
        if (hovered) this.hoveredNode = node;
        else if (this.hoveredNode === node) this.hoveredNode = null;
      },
      onClick: () => {
        this.setActiveCategory(node.categoryIndex);
        this.events.onSubSelect?.('skill', node.categoryIndex);
      },
    }));
  }

  override getSubLabels(): SubLabel[] {
    return this.nodes.map((node) => ({
      id: `skill:${node.categoryIndex}:${node.skillIndex}`,
      text: this.categories[node.categoryIndex].skills[node.skillIndex].name,
      anchor: node.mesh,
      offset: new THREE.Vector3(0, 0.95, 0),
    }));
  }

  /** Which labels should be shown right now: the active shell plus the hovered coin. */
  isSubLabelVisible(id: string): boolean {
    const [, category] = id.split(':');
    if (this.hoveredNode && id === `skill:${this.hoveredNode.categoryIndex}:${this.hoveredNode.skillIndex}`) return true;
    return Number(category) === this.activeCategory;
  }

  update(dt: number, elapsed: number): void {
    this.updateHighlight(dt);
    this.coreMaterial.uniforms['uTime'].value = elapsed;
    this.glow.material.opacity = 0.42 + Math.sin(elapsed * 1.3) * 0.08 + this.highlight * 0.15;

    this.shells.forEach((shell, i) => {
      shell.group.rotation.y += dt * shell.speed;
      const isActive = i === this.activeCategory;
      shell.ringMaterial.emissiveIntensity = damp(shell.ringMaterial.emissiveIntensity, isActive ? 1.6 : 0.45, 5, dt);
    });

    const cameraPosition = this.camera?.getWorldPosition(this.tmpCamera);
    for (const node of this.nodes) {
      const isActive = node.categoryIndex === this.activeCategory;
      const isHovered = node === this.hoveredNode;
      if (cameraPosition) node.mesh.lookAt(cameraPosition);
      const uniforms = node.material.uniforms;
      uniforms['uGlow'].value = damp(uniforms['uGlow'].value, isHovered ? 1 : isActive ? 0.5 : 0, 6, dt);
      uniforms['uOpacity'].value = damp(uniforms['uOpacity'].value, isActive || isHovered ? 1 : 0.45, 5, dt);
      node.scale = damp(node.scale, isHovered ? 1.7 : isActive ? 1.45 : 1.15, 6, dt);
      node.mesh.scale.setScalar(node.scale);
    }
  }

  override dispose(): void {
    super.dispose();
    this.coinGeometry.dispose();
    this.glowTexture.dispose();
  }
}
