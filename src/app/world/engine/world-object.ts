import * as THREE from 'three';

export interface Updatable {
  update(dt: number, elapsed: number): void;
}

export interface Disposable {
  dispose(): void;
}

/** Recursively frees geometries, materials and textures under an object. */
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else if (material) disposeMaterial(material);
  });
}

export function disposeMaterial(material: THREE.Material): void {
  const record = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (value instanceof THREE.Texture) value.dispose();
  }
  const shader = material as THREE.ShaderMaterial;
  if (shader.uniforms) {
    for (const uniform of Object.values(shader.uniforms)) {
      if (uniform.value instanceof THREE.Texture) uniform.value.dispose();
    }
  }
  material.dispose();
}

/** Shared material palette so every landmark feels part of the same world. */
export const Palette = {
  hullLight: 0x9aa4b8,
  hullMid: 0x5d6578,
  hullDark: 0x2b3142,
  trim: 0x1c2740,
  glass: 0x9ed1ff,
  accentBlue: 0x4f8cff,
  accentViolet: 0x8b6cff,
  accentCyan: 0x38d6e8,
  warmLight: 0xffe3b8,
};

export function metal(color: number, roughness = 0.38, metalness = 0.85): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export function emissive(color: number, intensity = 1.5, base = 0x000000): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: base,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.6,
    metalness: 0.1,
  });
}

export function glass(color = Palette.glass, opacity = 0.42): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });
}
