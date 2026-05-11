import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

// Queue management for concurrent 401s — only ONE refresh call happens at a time
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Skip the refresh-token endpoint itself to avoid infinite loop
  if (req.url.includes(API_ENDPOINTS.ACCOUNT.REFRESH_TOKEN)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(newToken => next(addToken(req, newToken!)))
        );
      }

      // Start the refresh process
      isRefreshing = true;
      refreshTokenSubject.next(null); // Block queued requests until refresh completes

      return authService.refreshTokens().pipe(
        switchMap((newToken: string) => {
          refreshTokenSubject.next(newToken); // Unblock all queued requests
          return next(addToken(req, newToken));
        }),
        catchError((refreshError) => {
          // Refresh failed — unblock queue then logout
          refreshTokenSubject.next(null);
          authService.logout();
          return throwError(() => refreshError);
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    })
  );
};

function addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
