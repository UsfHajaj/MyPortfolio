import * as THREE from 'three';

export interface Interactable {
  /** Stable identifier, e.g. "destination:projects" or "project:3". */
  id: string;
  object: THREE.Object3D;
  /** Optional: only pickable when this returns true (e.g. sub-items only at their destination). */
  isActive?: () => boolean;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
  cursor?: string;
}

/**
 * Raycast-based hover/click handling. Objects register themselves and the
 * picker resolves hits back to the registered root via a userData tag.
 */
export class InteractionSystem {
  private raycaster = new THREE.Raycaster();
  private interactables = new Map<string, Interactable>();
  private hovered: Interactable | null = null;
  private pickables: THREE.Object3D[] = [];
  private dirty = true;

  constructor(private readonly camera: THREE.Camera, private readonly element: HTMLElement) {
    this.raycaster.params.Points = { threshold: 0.6 };
    this.raycaster.params.Line = { threshold: 0.4 };
  }

  register(item: Interactable): void {
    item.object.traverse((child) => {
      child.userData['interactableId'] = item.id;
    });
    this.interactables.set(item.id, item);
    this.dirty = true;
  }

  unregister(id: string): void {
    const item = this.interactables.get(id);
    if (!item) return;
    item.object.traverse((child) => delete child.userData['interactableId']);
    this.interactables.delete(id);
    if (this.hovered === item) this.setHovered(null);
    this.dirty = true;
  }

  get hoveredId(): string | null {
    return this.hovered?.id ?? null;
  }

  pick(ndc: THREE.Vector2): Interactable | null {
    if (this.dirty) {
      this.pickables = Array.from(this.interactables.values()).map((i) => i.object);
      this.dirty = false;
    }
    const active = this.pickables.filter((o) => {
      const item = this.interactables.get(o.userData['interactableId']);
      return o.visible && (!item?.isActive || item.isActive());
    });
    if (!active.length) return null;
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(active, true);
    for (const hit of hits) {
      const id = hit.object.userData['interactableId'];
      const item = id ? this.interactables.get(id) : undefined;
      if (item) return item;
    }
    return null;
  }

  handlePointerMove(ndc: THREE.Vector2 | null): void {
    if (!ndc) {
      this.setHovered(null);
      return;
    }
    this.setHovered(this.pick(ndc));
  }

  handleClick(ndc: THREE.Vector2): Interactable | null {
    const item = this.pick(ndc);
    item?.onClick?.();
    return item;
  }

  clearHover(): void {
    this.setHovered(null);
  }

  private setHovered(item: Interactable | null): void {
    if (this.hovered === item) return;
    this.hovered?.onHover?.(false);
    this.hovered = item;
    this.hovered?.onHover?.(true);
    this.element.style.cursor = item ? (item.cursor ?? 'pointer') : '';
  }

  dispose(): void {
    this.setHovered(null);
    this.interactables.clear();
    this.pickables = [];
  }
}
