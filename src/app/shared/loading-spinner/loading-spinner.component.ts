import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-loading-spinner",
  imports: [CommonModule],
  standalone: true,
  templateUrl: "./loading-spinner.component.html",
  styleUrl: "./loading-spinner.component.css",
})
export class LoadingSpinnerComponent implements OnInit {
  stars: Array<{ left: number; top: number; delay: number }> = [];

  ngOnInit() {
    this.generateStars();
  }

  private generateStars() {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
      });
    }
  }
}
