import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }),
        animate('0.3s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ],
  template: `
    <div class="fixed top-4 right-4 z-[9999] p-4 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <div *ngFor="let toast of toastService.toasts()"
           @toastAnimation
           class="pointer-events-auto rounded-2xl shadow-xl border overflow-hidden backdrop-blur-xl bg-white/95"
           [ngClass]="getBorderClass(toast.type)">
           
        <div class="flex items-start p-4 bg-gradient-to-r" [ngClass]="getGradientClass(toast.type)">
          <!-- Icon -->
          <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" [ngClass]="getIconBgClass(toast.type)">
            <i [class]="getIconClass(toast.type)" class="text-base" [ngClass]="getIconColorClass(toast.type)"></i>
          </div>

          <!-- Content -->
          <div class="ml-4 flex-1">
            <h3 *ngIf="toast.title" class="text-sm font-bold text-gray-900 tracking-tight">{{ toast.title }}</h3>
            <h3 *ngIf="!toast.title" class="text-sm font-bold text-gray-900 tracking-tight">{{ getDefaultTitle(toast.type) }}</h3>
            <p class="mt-1 text-xs text-gray-600 font-medium leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <div class="ml-4 shrink-0 flex">
            <button (click)="toastService.remove(toast.id)" 
                    class="inline-flex text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 focus:outline-none transition-colors">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  getBorderClass(type: string): string {
    switch (type) {
      case 'success': return 'border-green-200/50';
      case 'error': return 'border-red-200/50';
      case 'warning': return 'border-amber-200/50';
      default: return 'border-blue-200/50';
    }
  }

  getGradientClass(type: string): string {
    switch (type) {
      case 'success': return 'from-green-50/50 to-white';
      case 'error': return 'from-red-50/50 to-white';
      case 'warning': return 'from-amber-50/50 to-white';
      default: return 'from-blue-50/50 to-white';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check';
      case 'error': return 'fas fa-exclamation';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info';
    }
  }

  getIconColorClass(type: string): string {
    switch (type) {
       case 'success': return 'text-green-600';
       case 'error': return 'text-red-600';
       case 'warning': return 'text-amber-600';
       default: return 'text-blue-600';
    }
  }

  getIconBgClass(type: string): string {
    switch (type) {
       case 'success': return 'bg-green-100 border border-green-200/50';
       case 'error': return 'bg-red-100 border border-red-200/50';
       case 'warning': return 'bg-amber-100 border border-amber-200/50';
       default: return 'bg-blue-100 border border-blue-200/50';
    }
  }

  getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Operation Successful';
      case 'error': return 'System Notice';
      case 'warning': return 'Attention Required';
      default: return 'Information';
    }
  }
}
