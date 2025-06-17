import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-canvas-background',
  standalone: true,
  templateUrl: "./canvas-background.component.html",
  styleUrl: "./canvas-background.component.css",
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