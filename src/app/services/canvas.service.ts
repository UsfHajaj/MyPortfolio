import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
}

@Injectable({
  providedIn: "root",
})
export class CanvasService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stars: Star[] = [];
  private animationFrameId: number = 0;
  private isDarkTheme = true;

  // To handle resize events
  private resizeSubject = new BehaviorSubject<boolean>(false);
  resize$ = this.resizeSubject.asObservable();

  constructor() {
    window.addEventListener("resize", () => {
      this.resizeSubject.next(true);
      this.resizeCanvas();
    });
  }

  initialize(canvas: HTMLCanvasElement, isDarkTheme: boolean): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.isDarkTheme = isDarkTheme;

    this.resizeCanvas();
    this.createStars();
    this.animate();
  }

  updateTheme(isDarkTheme: boolean): void {
    this.isDarkTheme = isDarkTheme;
    this.createStars(); // Regenerate stars with appropriate colors
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Recreate stars when canvas is resized
    this.createStars();
  }

  private createStars(): void {
    if (!this.canvas) return;

    this.stars = [];
    const starCount = Math.floor(
      (this.canvas.width * this.canvas.height) / 3000
    );

    for (let i = 0; i < starCount; i++) {
      const star: Star = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        color: this.isDarkTheme
          ? `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`
          : `rgba(0, 0, 0, ${Math.random() * 0.5 + 0.2})`,
        speed: Math.random() * 0.05 + 0.02,
      };

      this.stars.push(star);
    }
  }

  private animate(): void {
    if (!this.ctx || !this.canvas) return;

    // ✅ ارسم الخلفية أولاً
    this.ctx.fillStyle = this.isDarkTheme ? "#000000" : "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // ✅ ثم ارسم النجوم فوقها
    this.stars.forEach((star) => {
      this.ctx!.beginPath();
      this.ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx!.fillStyle = star.color;
      this.ctx!.fill();

      // Move star
      star.x += star.speed;
      if (star.x > this.canvas!.width) {
        star.x = 0;
      }
    });

    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener("resize", () => this.resizeCanvas());
  }
}
