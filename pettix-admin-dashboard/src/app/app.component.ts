import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmComponent } from './shared/components/confirm/confirm.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent, ConfirmComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-confirm></app-confirm>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AppComponent {
  title = 'Pettix Admin Dashboard';
}
