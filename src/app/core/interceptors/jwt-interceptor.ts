import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router) as Router; // <-- cast to Router
  const token = localStorage.getItem('token');

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(clonedReq).pipe(
    catchError(error => {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('token');
        router.navigate(['/login']); // now router is correctly typed
      }
      return throwError(() => error);
    })
  );
};
