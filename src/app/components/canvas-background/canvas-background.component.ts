import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-canvas-background',
  standalone: true,
  template: `<canvas #canvasElement></canvas>`,
  styles: [`
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -10;
    }
  `]
})
export class CanvasBackgroundComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('canvasElement', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() isDarkTheme: boolean = true;
  
  private resizeSubscription!: Subscription;

  constructor(private canvasService: CanvasService) {}

  ngOnInit(): void {
    this.canvasService.initialize(this.canvasRef.nativeElement, this.isDarkTheme);
    this.resizeSubscription = this.canvasService.resize$.subscribe(() => {
      // Canvas service handles the resize internally
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDarkTheme'] && !changes['isDarkTheme'].firstChange) {
      this.canvasService.updateTheme(this.isDarkTheme);
    }
  }

  ngOnDestroy(): void {
    this.canvasService.destroy();
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
}