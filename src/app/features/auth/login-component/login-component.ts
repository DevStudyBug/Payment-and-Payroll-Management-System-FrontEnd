import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginRequest } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Clear error when user starts typing
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = false;

    const credentials: LoginRequest = {
      userName: this.loginForm.value.userName,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Check organization status first
        if (response.orgStatus === 'PENDING') {
          this.errorMessage = 'Your organization is pending verification. Please wait for admin approval.';
          this.authService.logout(); // Clear any stored data
          return;
        }

        // Handle successful login with verified status
        const roles = Array.from(response.roles); // Convert Set to Array if needed
        
        // Priority-based routing
        if (roles.includes('BANK_ADMIN')) {
          this.router.navigate(['/BANK_ADMIN']);
        } else if (roles.includes('ORG_ADMIN')) {
          this.router.navigate(['/ORG_ADMIN']);
        } else if (roles.includes('EMPLOYEE')) {
          this.router.navigate(['/EMPLOYEE']);
        } else {
          this.router.navigate(['/dashboard']);
        }

        // Optional: Show success message
        if (response.message) {
          console.log(response.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Check if backend sends specific error message
        this.errorMessage = err.error?.message || 'Invalid username or password!';
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/organization/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
