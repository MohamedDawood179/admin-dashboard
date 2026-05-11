import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../core/constants/app-routes';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A202C] via-[#2D3748] to-[#4A5568] px-4 overflow-hidden relative">
      <!-- Decorative Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-20 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 opacity-10 blur-[120px] rounded-full"></div>
      
      <div class="w-full max-w-md animate-fade-in relative z-10">
        <!-- Logo/Brand -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-2xl mb-6 group hover:scale-110 transition-transform duration-500">
            <i class="fas fa-paw text-4xl text-primary group-hover:rotate-12 transition-transform"></i>
          </div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight">Pettix Admin</h1>
          <p class="text-gray-400 mt-2 font-medium">Command Center & Analytics</p>
        </div>

        <!-- Login Card -->
        <div class="glass p-8 rounded-[2rem] shadow-2xl border-white/20 backdrop-blur-2xl">
          <form (submit)="onSubmit()" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">Identity</label>
              <div class="relative group">
                <i class="far fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"></i>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email"
                  required
                  placeholder="admin@pettix.com"
                  class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">Security Key</label>
              <div class="relative group">
                <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"></i>
                <input 
                  type="password" 
                  [(ngModel)]="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
              </div>
            </div>

            <div *ngIf="errorMessage()" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-shake">
              <i class="fas fa-exclamation-circle mr-2"></i> {{ errorMessage() }}
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading()">Access Terminal</span>
              <i *ngIf="isLoading()" class="fas fa-circle-notch animate-spin"></i>
              <i *ngIf="!isLoading()" class="fas fa-arrow-right text-sm"></i>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
            <span class="flex items-center gap-1.5"><i class="fas fa-shield-alt text-green-500"></i> Secure Node</span>
            <span>v2.1.5 Stable</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private routes = APP_ROUTES;

  onSubmit(): void {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate([`/${this.routes.DASHBOARD.ROOT}`]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Authentication failed. Please check your credentials.');
      }
    });
  }
}
