// src/app/features/auth/login/login.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { userName, password } = this.loginForm.value;

    this.authService.login({ userName, password }).subscribe({
      next: (res) => {
        if (res.token) {
          this.authService.setToken(res.token);
          this.router.navigate(['/bank-admin']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid credentials!';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
