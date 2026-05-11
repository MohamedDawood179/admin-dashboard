import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../core/constants/app-routes';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full w-64 bg-sidebar text-white flex flex-col">
      <div class="p-6 flex items-center gap-3">
        <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">P</div>
        <span class="text-xl font-bold tracking-tight">Pettix Admin</span>
      </div>

      <nav class="flex-1 mt-6 px-4 space-y-2">
        <a [routerLink]="['/' + routes.DASHBOARD.ROOT]" routerLinkActive="bg-primary shadow-lg" [routerLinkActiveOptions]="{exact: true}"
           class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white hover:bg-opacity-10 group">
          <i class="fas fa-th-large opacity-70 group-hover:opacity-100"></i>
          <span class="font-medium">Dashboard</span>
        </a>
        <a [routerLink]="['/' + routes.DASHBOARD.USER_MANAGEMENT]" routerLinkActive="bg-primary shadow-lg"
           class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white hover:bg-opacity-10 group">
          <i class="fas fa-users opacity-70 group-hover:opacity-100"></i>
          <span class="font-medium">Users</span>
        </a>
        <a [routerLink]="['/' + routes.DASHBOARD.PET_MANAGEMENT]" routerLinkActive="bg-primary shadow-lg"
           class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white hover:bg-opacity-10 group">
          <i class="fas fa-dog opacity-70 group-hover:opacity-100"></i>
          <span class="font-medium">Pets</span>
        </a>
        <a [routerLink]="['/' + routes.DASHBOARD.ADOPTIONS]" routerLinkActive="bg-primary shadow-lg"
           class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white hover:bg-opacity-10 group">
          <i class="fas fa-heart opacity-70 group-hover:opacity-100"></i>
          <span class="font-medium">Adoptions</span>
        </a>
        
        <div class="pt-6 pb-2 px-4 uppercase text-[10px] font-bold text-gray-500 tracking-[0.2em]">Community</div>
        <a [routerLink]="['/' + routes.DASHBOARD.TIMELINE]" routerLinkActive="bg-primary shadow-lg"
           class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white hover:bg-opacity-10 group">
          <i class="fas fa-stream opacity-70 group-hover:opacity-100"></i>
          <span class="font-medium">Timeline</span>
        </a>

      </nav>

      <div class="p-6 border-t border-white/5 bg-black/10">
        <div *ngIf="user()" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shadow-inner">
            <img *ngIf="user()?.avatar" [src]="user()?.avatar" [alt]="user()?.name">
            <i *ngIf="!user()?.avatar" class="fas fa-user-shield text-primary"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold truncate text-gray-100">{{user()?.name}}</p>
            <p class="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">{{user()?.role}}</p>
          </div>
          <button (click)="onLogout()" class="text-gray-500 hover:text-red-400 transition-colors">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  routes = APP_ROUTES;
  user = this.authService.currentUser;

  onLogout(): void {
    this.authService.logout();
  }
}
