import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization-service';

@Component({
  selector: 'app-register-organization',
  // REMOVED: standalone: true, 
  //  REMOVED: imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-organization.html',
  styleUrls: ['./register-organization.css']
})
export class RegisterOrganization {

  registerForm: FormGroup;
  errorMessage: string = '';

  // The constructor is correct. The Router injection will work once the @Component decorator is non-standalone.
  constructor(private fb: FormBuilder, private orgService: OrganizationService, private router: Router) {
    this.registerForm = this.fb.group({
      orgName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      registrationNo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.orgService.registerOrganization(this.registerForm.value).subscribe({
      next: (res) => {
        // NOTE: Changed alert() to console log, as alert() is blocked in modern Angular environments.
        console.log(res.message || 'Organization registered successfully! Please verify your email.'); 
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Registration failed! Please try again.';
      }
    });
  }
}