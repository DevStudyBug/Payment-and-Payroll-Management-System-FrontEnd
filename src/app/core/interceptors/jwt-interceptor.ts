import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from AuthService
  const token = authService.getToken();

  // Don't add auth headers to external URLs (Cloudinary, etc)
  const isExternalUrl = req.url.includes('cloudinary.com') || 
                        req.url.includes('http://') && !req.url.includes('localhost') ||
                        req.url.includes('https://') && !req.url.includes(window.location.hostname);

  // Clone request and add Authorization header only for internal API calls
  if (token && !isExternalUrl && !req.url.includes('/login') && !req.url.includes('/register')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Handle response and errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        console.warn('Unauthorized: Token expired or invalid');
        authService.logout();
        router.navigate(['/login']);
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.warn('Forbidden: Insufficient permissions');
      }

      return throwError(() => error);
    })
  );
};