import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
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

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const { userName, password } = this.loginForm.value;

    this.authService.login({ userName, password }).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.token) {
          this.authService.setToken(res.token);

          const role = res.role || 'bank-admin';
          this.router.navigate([`/${role}`]);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials! Please try again.';

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
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
