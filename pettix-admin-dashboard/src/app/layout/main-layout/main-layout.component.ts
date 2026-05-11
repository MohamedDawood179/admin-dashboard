import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent, ToastComponent],
  template: `
    <div class="flex h-screen bg-background overflow-hidden relative">
      <!-- Toaster -->
      <app-toast></app-toast>

      <!-- Sidebar -->
      <app-sidebar class="flex-shrink-0 hidden lg:block"></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navbar -->
        <app-header></app-header>

        <!-- Main Scrollable Content -->
        <main class="flex-1 overflow-y-auto p-8">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class MainLayoutComponent {}
