// src/app/core/services/auth-service.ts
import { Injectable } from '@angular/core'; // 👈 NG2005: Ensure @Injectable is imported and present
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

interface LoginPayload {
  userName: string;
  password: string;
}

interface LoginResponse {
  token: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'authToken';

  // NG2003: Router dependency will be resolvable once RouterModule.forRoot is imported
  constructor(private http: HttpClient, private router: Router) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/login', payload);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
 isLoggedIn(): boolean {
    return !!this.getToken();
  }
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/auth/login']);
  }
}