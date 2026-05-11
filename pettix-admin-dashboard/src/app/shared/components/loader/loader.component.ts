import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading" 
         [ngClass]="isOverlay ? 'absolute inset-0 z-50 rounded-3xl bg-white/60 backdrop-blur-[2px]' : 'flex py-12 w-full'"
         class="flex flex-col items-center justify-center transition-all duration-300">
      <div class="relative">
        <div class="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <i class="fas fa-paw absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse text-lg"></i>
      </div>
      <p class="mt-4 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase animate-pulse">{{message}}</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoaderComponent {
  @Input() loading = false;
  @Input() message = 'Synchronizing Data...';
  @Input() isOverlay = true;
}
