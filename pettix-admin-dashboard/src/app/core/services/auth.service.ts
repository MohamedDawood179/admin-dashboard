import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError } from 'rxjs';
import { LoginResponse, User } from '../models/auth.models';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { APP_ROUTES } from '../constants/app-routes';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  currentUser = signal<User | null>(this.tokenService.getUser());

  login(credentials: { email: string; password: string }): Observable<boolean> {
    return this.http.post<any>(API_ENDPOINTS.ACCOUNT.LOGIN, credentials).pipe(
      map(res => res.result as LoginResponse),
      tap(response => {
        if (response.role !== 'Admin') {
          throw new Error('Access denied. Admin role required.');
        }
        this.setSession(response);
      }),
      map(() => true),
      catchError(err => {
        console.error('Login failed', err);
        throw err;
      })
    );
  }

  logout(): void {
    this.tokenService.clear();
    this.currentUser.set(null);
    this.router.navigate([`/${APP_ROUTES.AUTH.LOGIN}`]);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  refreshTokens(): Observable<string> {
    const accessToken = this.tokenService.getToken();
    const refreshToken = this.tokenService.getRefreshToken();

    return this.http.post<any>(API_ENDPOINTS.ACCOUNT.REFRESH_TOKEN, { accessToken, refreshToken }).pipe(
      map(res => res.result as { token: string; refreshToken: string }),
      tap(tokens => {
        this.tokenService.setToken(tokens.token);
        this.tokenService.setRefreshToken(tokens.refreshToken);
      }),
      map(tokens => tokens.token)
    );
  }

  private setSession(authResult: LoginResponse): void {
    this.tokenService.setToken(authResult.token);
    this.tokenService.setRefreshToken(authResult.refreshToken);

    const user: User = {
      id: authResult.contact.id,
      email: authResult.contact.email || '',
      name: authResult.contact.nameEn || authResult.contact.nameAr || 'Admin',
      role: authResult.role,
      avatar: authResult.contact.avatar
    };

    this.tokenService.setUser(user);
    this.currentUser.set(user);
  }
}
