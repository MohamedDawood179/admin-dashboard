import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { guestGuard } from './core/guards/guest.guard';
import { APP_ROUTES } from './core/constants/app-routes';

export const routes: Routes = [
  {
    path: APP_ROUTES.AUTH.LOGIN,
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: APP_ROUTES.DASHBOARD.ROOT,
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.USER_MANAGEMENT,
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.USER_DETAILS,
        loadComponent: () => import('./features/users/user-details/user-details.component').then(m => m.UserDetailsComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.PET_MANAGEMENT,
        loadComponent: () => import('./features/pets/pets.component').then(m => m.PetsComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.PET_DETAILS,
        loadComponent: () => import('./features/pets/pet-details/pet-details.component').then(m => m.PetDetailsComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.ADOPTIONS,
        loadComponent: () => import('./features/adoptions/adoptions.component').then(m => m.AdoptionsComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.TIMELINE,
        loadComponent: () => import('./features/timeline/timeline.component').then(m => m.TimelineComponent)
      },
      {
        path: APP_ROUTES.DASHBOARD.POST_DETAILS,
        loadComponent: () => import('./features/timeline/post-details/post-details.component').then(m => m.PostDetailsComponent)
      },


      {
        path: APP_ROUTES.DASHBOARD.REPORTS,
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: '',
        redirectTo: APP_ROUTES.DASHBOARD.ROOT,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: APP_ROUTES.DASHBOARD.ROOT
  }
];
