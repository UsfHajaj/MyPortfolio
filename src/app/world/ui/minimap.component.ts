import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinationId, OVERVIEW_POSE, ViewId } from '../engine/destinations';
import { MinimapState } from '../engine/space-world';
import { WorldStateService } from '../world-state.service';

const SIZE = 168;
const WORLD_EXTENT = 125; // world units mapped to half the minimap

/**
 * Top-down chart of the system. Draws every destination, the camera position
 * and heading; clicking a marker flies there.
 */
@Component({
  selector: 'app-minimap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="minimap" [class.minimap--collapsed]="collapsed">
      <div class="minimap__head">
        <span class="minimap__title">System chart</span>
        <button type="button" class="minimap__toggle" (click)="collapsed = !collapsed" [attr.aria-label]="collapsed ? 'Expand chart' : 'Collapse chart'">
          <i class="fa-solid" [class.fa-chevron-down]="!collapsed" [class.fa-chevron-up]="collapsed" aria-hidden="true"></i>
        </button>
      </div>
      <canvas #canvas class="minimap__canvas" [width]="size * dpr" [height]="size * dpr" [style.width.px]="size" [style.height.px]="size" (click)="onClick($event)" aria-label="Minimap of the system. Click a marker to travel." role="img"></canvas>
      <button type="button" class="minimap__overview" (click)="select.emit('overview')" [class.active]="state.targetView() === 'overview'">
        <i class="fa-solid fa-expand" aria-hidden="true"></i> Overview
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .minimap {
        width: 100%;
        background: var(--hud-bg);
        border: 1px solid var(--hud-border);
        border-radius: 14px;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        padding: 0.55rem 0.6rem 0.6rem;
        box-shadow: 0 20px 50px -30px rgba(0, 0, 0, 0.8);
      }
      .minimap__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.35rem;
      }
      .minimap__title {
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--hud-muted);
      }
      .minimap__toggle {
        color: var(--hud-muted);
        font-size: 0.7rem;
        padding: 0.2rem 0.35rem;
        border-radius: 6px;
      }
      .minimap__toggle:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.06);
      }
      .minimap__canvas {
        display: block;
        border-radius: 10px;
        background: radial-gradient(circle at 50% 50%, rgba(40, 60, 130, 0.35), rgba(5, 8, 20, 0.6) 70%);
        cursor: crosshair;
      }
      .minimap--collapsed .minimap__canvas,
      .minimap--collapsed .minimap__overview {
        display: none;
      }
      .minimap__overview {
        margin-top: 0.5rem;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--hud-muted);
        padding: 0.4rem;
        border-radius: 8px;
        border: 1px solid transparent;
      }
      .minimap__overview:hover,
      .minimap__overview.active {
        color: #fff;
        border-color: var(--hud-border);
        background: rgba(79, 140, 255, 0.12);
      }
    `,
  ],
})
export class MinimapComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() select = new EventEmitter<ViewId>();
  readonly state = inject(WorldStateService);
  readonly size = SIZE;
  readonly dpr = Math.min(window.devicePixelRatio || 1, 2);
  collapsed = false;

  private ctx: CanvasRenderingContext2D | null = null;
  private pulse = 0;

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
  }

  /** Called every frame from the world loop (outside Angular). */
  draw(map: MinimapState, dt: number): void {
    const ctx = this.ctx;
    if (!ctx || this.collapsed) return;
    this.pulse = (this.pulse + dt) % 2;
    const s = this.size;
    const d = this.dpr;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, s, s);

    const toMap = (x: number, z: number): [number, number] => [s / 2 + (x / WORLD_EXTENT) * (s / 2) * 0.86, s / 2 + ((z - 30) / WORLD_EXTENT) * (s / 2) * 0.86];

    // Range rings
    ctx.strokeStyle = 'rgba(120,150,230,0.14)';
    ctx.lineWidth = 1;
    for (const r of [0.3, 0.6, 0.9]) {
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, (s / 2) * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(s / 2, 4);
    ctx.lineTo(s / 2, s - 4);
    ctx.moveTo(4, s / 2);
    ctx.lineTo(s - 4, s / 2);
    ctx.strokeStyle = 'rgba(120,150,230,0.08)';
    ctx.stroke();

    // Camera view cone
    const [cx, cz] = toMap(map.cameraX, map.cameraZ);
    const heading = Math.atan2(map.forwardZ, map.forwardX);
    ctx.save();
    ctx.translate(cx, cz);
    ctx.rotate(heading);
    const cone = ctx.createLinearGradient(0, 0, 34, 0);
    cone.addColorStop(0, 'rgba(120,170,255,0.35)');
    cone.addColorStop(1, 'rgba(120,170,255,0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 34, -0.5, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Destinations
    const current = this.state.currentView();
    const target = this.state.targetView();
    const hovered = this.state.hoveredDestination()?.id;
    for (const dest of this.state.destinations) {
      const [x, y] = toMap(dest.focus[0], dest.focus[2]);
      const isTarget = dest.id === target;
      const isCurrent = dest.id === current && !this.state.travelling();
      const isHover = dest.id === hovered;
      ctx.beginPath();
      ctx.arc(x, y, isTarget ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isTarget || isHover ? '#ffffff' : dest.color;
      ctx.globalAlpha = isTarget || isHover ? 1 : 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (isCurrent || isTarget) {
        const ringR = 6 + (this.pulse % 1) * 7;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - (this.pulse % 1))})`;
        ctx.stroke();
      }
      ctx.font = `${isTarget ? 600 : 400} 9px 'Fira Code', monospace`;
      ctx.fillStyle = isTarget ? '#ffffff' : 'rgba(200,212,240,0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(dest.label.toUpperCase(), x, y - 7);
    }

    // Camera marker
    ctx.beginPath();
    ctx.arc(cx, cz, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cz, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();
  }

  onClick(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const s = this.size;
    let best: { id: DestinationId; dist: number } | null = null;
    for (const dest of this.state.destinations) {
      const x = s / 2 + (dest.focus[0] / WORLD_EXTENT) * (s / 2) * 0.86;
      const y = s / 2 + ((dest.focus[2] - 30) / WORLD_EXTENT) * (s / 2) * 0.86;
      const dist = Math.hypot(px - x, py - y);
      if (dist < 16 && (!best || dist < best.dist)) best = { id: dest.id, dist };
    }
    if (best) this.select.emit(best.id);
    else this.select.emit('overview');
  }

  /** Exposed for the overview button so callers know its pose exists. */
  readonly overviewPose = OVERVIEW_POSE;
}
