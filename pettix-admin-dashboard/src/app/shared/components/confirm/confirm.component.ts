import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }),
        animate('0.3s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.25s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ],
  template: `
    <div *ngIf="confirmService.activeConfirm() as config" 
         class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      
      <!-- Backdrop -->
      <div @backdropAnimation 
           (click)="onCancel()"
           class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <!-- Modal Container -->
      <div @modalAnimation
           class="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        <!-- Header / Banner (Dynamic Color) -->
        <div class="h-32 w-full relative overflow-hidden" [ngClass]="getBannerBg(config.type)">
           <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl" [ngClass]="getIconColor(config.type)">
                 <i [class]="getIcon(config.type)"></i>
              </div>
           </div>
        </div>

        <div class="p-8 text-center">
           <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ config.title }}</h2>
           <p class="mt-3 text-sm text-gray-500 font-medium leading-relaxed px-4 whitespace-pre-line">{{ config.message }}</p>
        </div>

        <div class="p-8 pt-0 grid grid-cols-2 gap-4">
           <button (click)="onCancel()"
                   class="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-95">
              {{ config.cancelText }}
           </button>
           <button (click)="onConfirm()"
                   class="px-6 py-4 shadow-lg active:scale-95 transition-all text-sm font-bold text-white rounded-2xl shadow-primary/20"
                   [ngClass]="getButtonBg(config.type)">
              {{ config.confirmText }}
           </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmComponent {
  confirmService = inject(ConfirmService);

  onConfirm() {
    this.confirmService.resolve(true);
  }

  onCancel() {
    this.confirmService.resolve(false);
  }

  getBannerBg(type?: string): string {
    switch (type) {
      case 'danger': return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'warning': return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
      default: return 'bg-gradient-to-br from-primary to-blue-500';
    }
  }

  getButtonBg(type?: string): string {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-500/20';
      case 'warning': return 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20';
      default: return 'bg-primary hover:bg-blue-600';
    }
  }

  getIconColor(type?: string): string {
    switch (type) {
      case 'danger': return 'text-red-500';
      case 'warning': return 'text-indigo-500';
      default: return 'text-primary';
    }
  }

  getIcon(type?: string): string {
    switch (type) {
      case 'danger': return 'fas fa-trash-alt';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-question';
    }
  }
}
