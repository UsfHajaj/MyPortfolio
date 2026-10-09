import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldStateService } from '../world-state.service';
import { PROFILE } from '../../data/portfolio.data';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader" [class.ready]="state.ready()" role="dialog" aria-live="polite" aria-label="Loading the portfolio universe">
      <div class="loader__stars" aria-hidden="true">
        <span *ngFor="let s of stars" class="star" [style.left.%]="s.x" [style.top.%]="s.y" [style.animation-delay.s]="s.delay" [style.width.px]="s.size" [style.height.px]="s.size"></span>
      </div>

      <div class="loader__content">
        <p class="loader__eyebrow">Portfolio · Interactive universe</p>
        <h1 class="loader__name">{{ profile.name }}</h1>
        <p class="loader__title">{{ profile.headline }}</p>

        <div class="loader__orbit" aria-hidden="true">
          <div class="orbit orbit--a"></div>
          <div class="orbit orbit--b"></div>
          <div class="orbit orbit--c"></div>
          <div class="core"></div>
        </div>

        <div class="loader__progress" *ngIf="!state.ready()">
          <div class="bar"><div class="bar__fill" [style.width.%]="state.loadProgress() * 100"></div></div>
          <div class="meta">
            <span class="status">{{ state.loadStatus() }}</span>
            <span class="pct">{{ (state.loadProgress() * 100) | number: '1.0-0' }}%</span>
          </div>
        </div>

        <div class="loader__actions" *ngIf="state.ready()">
          <button type="button" class="btn btn--primary" (click)="enter.emit(false)" autofocus>
            Enter the universe
          </button>
          <button type="button" class="btn btn--ghost" (click)="enter.emit(true)">
            <i class="fa-solid fa-volume-high" aria-hidden="true"></i>
            Enter with sound
          </button>
          <button type="button" class="link" (click)="classic.emit()">Prefer a simple page? Open the classic version</button>
        </div>
      </div>

      <p class="loader__hint" *ngIf="!state.ready()">Tip: use the number keys 1–7 to jump between locations once inside.</p>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 60;
        display: block;
      }
      .loader {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: radial-gradient(ellipse at 50% 30%, #0b1230 0%, #04060f 55%, #020309 100%);
        color: #e8eefc;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      }
      .loader__stars {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .star {
        position: absolute;
        border-radius: 50%;
        background: #fff;
        opacity: 0.4;
        animation: twinkle 3.2s ease-in-out infinite;
      }
      @keyframes twinkle {
        0%,
        100% {
          opacity: 0.15;
        }
        50% {
          opacity: 0.8;
        }
      }
      .loader__content {
        position: relative;
        text-align: center;
        padding: 2rem;
        max-width: 560px;
        width: 100%;
      }
      .loader__eyebrow {
        font-family: 'Fira Code', monospace;
        font-size: 0.68rem;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: rgba(140, 170, 255, 0.75);
        margin-bottom: 1rem;
      }
      .loader__name {
        font-family: 'Space Grotesk', 'Inter', sans-serif;
        font-weight: 600;
        font-size: clamp(2rem, 6vw, 3.4rem);
        letter-spacing: -0.02em;
        line-height: 1;
        margin: 0;
      }
      .loader__title {
        margin-top: 0.9rem;
        font-size: 0.95rem;
        color: rgba(200, 212, 240, 0.72);
      }
      .loader__orbit {
        position: relative;
        width: 140px;
        height: 140px;
        margin: 2.2rem auto 2rem;
      }
      .orbit {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba(120, 160, 255, 0.25);
        border-top-color: rgba(140, 180, 255, 0.9);
        animation: spin 3s linear infinite;
      }
      .orbit--b {
        inset: 18px;
        animation-duration: 2.2s;
        animation-direction: reverse;
        border-top-color: rgba(160, 130, 255, 0.9);
      }
      .orbit--c {
        inset: 36px;
        animation-duration: 1.6s;
        border-top-color: rgba(80, 220, 240, 0.9);
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .core {
        position: absolute;
        inset: 56px;
        border-radius: 50%;
        background: radial-gradient(circle, #cfe3ff 0%, #4f8cff 45%, rgba(79, 140, 255, 0) 75%);
        box-shadow: 0 0 40px rgba(79, 140, 255, 0.6);
        animation: pulse 2s ease-in-out infinite;
      }
      @keyframes pulse {
        0%,
        100% {
          transform: scale(0.9);
        }
        50% {
          transform: scale(1.08);
        }
      }
      .bar {
        height: 2px;
        background: rgba(140, 170, 255, 0.15);
        border-radius: 2px;
        overflow: hidden;
      }
      .bar__fill {
        height: 100%;
        background: linear-gradient(90deg, #4f8cff, #8b6cff, #38d6e8);
        transition: width 0.4s ease;
      }
      .meta {
        display: flex;
        justify-content: space-between;
        margin-top: 0.6rem;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        color: rgba(190, 205, 235, 0.7);
      }
      .loader__actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;
        animation: rise 0.6s ease both;
      }
      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.85rem 1.8rem;
        border-radius: 999px;
        font-size: 0.82rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-weight: 600;
        transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        min-width: 240px;
        justify-content: center;
      }
      .btn--primary {
        background: linear-gradient(135deg, #3d7bff, #7a5cff);
        color: #fff;
        box-shadow: 0 16px 40px -14px rgba(79, 140, 255, 0.8);
      }
      .btn--primary:hover,
      .btn--primary:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 20px 50px -14px rgba(79, 140, 255, 0.95);
        outline: none;
      }
      .btn--ghost {
        border: 1px solid rgba(140, 170, 255, 0.3);
        color: #dbe6ff;
        background: rgba(10, 16, 36, 0.4);
      }
      .btn--ghost:hover,
      .btn--ghost:focus-visible {
        background: rgba(40, 60, 120, 0.45);
        outline: none;
      }
      .link {
        margin-top: 0.4rem;
        font-size: 0.78rem;
        color: rgba(190, 205, 235, 0.65);
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .link:hover {
        color: #fff;
      }
      .loader__hint {
        position: absolute;
        bottom: 1.6rem;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 0.74rem;
        color: rgba(190, 205, 235, 0.45);
        padding: 0 1rem;
      }
      @media (prefers-reduced-motion: reduce) {
        .orbit,
        .core,
        .star {
          animation: none;
        }
      }
    `,
  ],
})
export class LoadingScreenComponent {
  readonly state = inject(WorldStateService);
  readonly profile = PROFILE;
  @Output() enter = new EventEmitter<boolean>();
  @Output() classic = new EventEmitter<void>();

  stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() < 0.15 ? 2 : 1,
  }));
}
