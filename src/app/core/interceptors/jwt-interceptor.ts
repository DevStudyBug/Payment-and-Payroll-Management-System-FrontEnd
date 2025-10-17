import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable() // 👈 Must be decorated as Injectable
export class JwtInterceptor implements HttpInterceptor {

  // Inject Router into the constructor, resolving the injection token issue
  constructor(private router: Router) {} 

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Note: AuthService uses 'authToken', so we'll use that key here.
    const token = localStorage.getItem('authToken'); 

    let clonedReq = request;
    if (token) {
      clonedReq = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          // Navigate to the correct login path
          this.router.navigate(['/auth/login']); 
        }
        return throwError(() => error);
      })
    );
  }
}