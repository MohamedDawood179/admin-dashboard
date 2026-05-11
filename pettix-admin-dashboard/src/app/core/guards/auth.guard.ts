import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app-routes';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  if (authService.isLoggedIn() && !authService.isAdmin()) {
    authService.logout();
  }

  return router.createUrlTree([`/${APP_ROUTES.AUTH.LOGIN}`]);
};
