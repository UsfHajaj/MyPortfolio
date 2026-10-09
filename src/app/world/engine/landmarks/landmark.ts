import * as THREE from 'three';
import { DestinationId } from '../destinations';
import { Interactable } from '../interaction';
import { damp } from '../tween';
import { Disposable, disposeObject3D, Updatable } from '../world-object';

export interface SubLabel {
  id: string;
  text: string;
  /** Object whose world position anchors the label. */
  anchor: THREE.Object3D;
  offset?: THREE.Vector3;
}

export interface LandmarkEvents {
  onSubSelect?: (kind: string, index: number) => void;
}

/**
 * Base class for every portfolio location. Handles the hover glow shared by all
 * landmarks and exposes the hooks the world uses for picking and labelling.
 */
export abstract class Landmark extends THREE.Group implements Updatable, Disposable {
  abstract readonly destinationId: DestinationId;
  /** Local-space offset used to anchor the HTML label. */
  labelOffset = new THREE.Vector3(0, 6, 0);

  protected highlight = 0;
  protected highlightTarget = 0;
  protected active = false;
  protected camera: THREE.Camera | null = null;

  attachCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }
  protected glowMaterials: Array<{ material: THREE.MeshStandardMaterial; base: number }> = [];

  setHovered(hovered: boolean): void {
    this.highlightTarget = hovered ? 1 : 0;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  /** Sub-interactables (project panels, experience modules…). */
  getInteractables(): Interactable[] {
    return [];
  }

  getSubLabels(): SubLabel[] {
    return [];
  }

  /** Called when assets for this destination should start loading. */
  preload(): void {
    /* optional */
  }

  protected trackGlow(material: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
    this.glowMaterials.push({ material, base: material.emissiveIntensity });
    return material;
  }

  protected updateHighlight(dt: number): void {
    this.highlight = damp(this.highlight, this.highlightTarget, 8, dt);
    const boost = 1 + this.highlight * 0.9;
    for (const entry of this.glowMaterials) {
      entry.material.emissiveIntensity = entry.base * boost;
    }
  }

  abstract update(dt: number, elapsed: number): void;

  override dispose(): void {
    disposeObject3D(this);
  }
}
