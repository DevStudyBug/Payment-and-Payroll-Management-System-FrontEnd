// organization.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization-service';
import { AuthService } from '../../../core/services/auth-service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-org-admin-dashboard-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './org-admin-dashboard-component.html',
  styleUrl: './org-admin-dashboard-component.css'
})
export class OrgAdminDashboardComponent implements OnInit {
  // State Management
  activeTab: string = 'dashboard';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Data
  onboardingStatus: any = null;
  designations: any[] = [];
  salaryTemplates: any[] = [];
  employees: any[] = [];
  concerns: any[] = [];

  // Forms
  designationForm!: FormGroup;
  salaryTemplateForm!: FormGroup;
  employeeForm!: FormGroup;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadOnboardingStatus();
    this.loadDesignations();
    this.loadSalaryTemplates();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Form Initialization
  initializeForms(): void {
    this.designationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.salaryTemplateForm = this.fb.group({
      designation: ['', Validators.required],
      basicSalary: ['', [Validators.required, Validators.min(0)]],
      hra: ['', [Validators.required, Validators.min(0)]],
      da: ['', [Validators.required, Validators.min(0)]],
      pf: ['', [Validators.required, Validators.min(0)]],
      otherAllowances: ['', [Validators.required, Validators.min(0)]]
    });

    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dob: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Load Data Methods
  loadOnboardingStatus(): void {
    this.orgService.getOnboardingStatus()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Onboarding status loaded'))
      )
      .subscribe({
        next: (data) => {
          console.log('Onboarding Status:', data);
          this.onboardingStatus = data;
        },
        error: (error) => {
          console.error('Failed to load onboarding status', error);
          this.showError('Failed to load onboarding status');
        }
      });
  }

  loadDesignations(): void {
    this.orgService.getAllDesignations()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Designations loaded'))
      )
      .subscribe({
        next: (data) => {
          console.log('Designations:', data);
          this.designations = data || [];
        },
        error: (error) => {
          console.error('Failed to load designations', error);
          this.designations = [];
        }
      });
  }

  loadSalaryTemplates(): void {
    this.orgService.getAllSalaryTemplates(this.currentPage, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Salary templates loaded'))
      )
      .subscribe({
        next: (data) => {
          console.log('Salary Templates:', data);
          this.salaryTemplates = data.content || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        },
        error: (error) => {
          console.error('Failed to load salary templates', error);
          this.showError('Failed to load salary templates');
          this.salaryTemplates = [];
        }
      });
  }

  loadEmployees(status: string = 'ALL'): void {
    this.orgService.getEmployeesByStatus(status)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Employees loaded'))
      )
      .subscribe({
        next: (data) => {
          console.log('Employees:', data);
          this.employees = data || [];
        },
        error: (error) => {
          console.error('Failed to load employees', error);
          this.showError('Failed to load employees');
          this.employees = [];
        }
      });
  }

  loadConcerns(): void {
    this.orgService.getAllConcerns(undefined, undefined, undefined, this.currentPage, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Concerns loaded'))
      )
      .subscribe({
        next: (data) => {
          console.log('Concerns:', data);
          this.concerns = data.content || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        },
        error: (error) => {
          console.error('Failed to load concerns', error);
          this.showError('Failed to load concerns');
          this.concerns = [];
        }
      });
  }

  // Designation Management
  addDesignation(): void {
    if (this.designationForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (!confirm('Are you sure you want to add this designation?')) {
      return;
    }

    this.isLoading = true;
    const name = this.designationForm.get('name')?.value;

    this.orgService.addDesignation(name)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Designation added:', response);
          this.showSuccess('✅ Designation added successfully');
          this.designationForm.reset();
          this.loadDesignations();
        },
        error: (error) => {
          console.error('Failed to add designation:', error);
          this.showError(error.error?.message || 'Failed to add designation');
        }
      });
  }

  // Salary Template Management
  createSalaryTemplate(): void {
    if (this.salaryTemplateForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (!confirm('Are you sure you want to create this salary template?')) {
      return;
    }

    this.isLoading = true;
    this.orgService.createSalaryTemplate(this.salaryTemplateForm.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Salary template created:', response);
          this.showSuccess('✅ Salary template created successfully');
          this.salaryTemplateForm.reset();
          this.loadSalaryTemplates();
        },
        error: (error) => {
          console.error('Failed to create salary template:', error);
          this.showError(error.error?.message || 'Failed to create salary template');
        }
      });
  }

  // Employee Management
  registerEmployee(): void {
    if (this.employeeForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (!confirm('Are you sure you want to register this employee?')) {
      return;
    }

    this.isLoading = true;
    this.orgService.registerEmployee(this.employeeForm.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Employee registered:', response);
          this.showSuccess(`✅ Employee registered successfully. Username: ${response.username}`);
          this.employeeForm.reset();
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Failed to register employee:', error);
          this.showError(error.error?.message || 'Failed to register employee');
        }
      });
  }

  uploadEmployeesExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.showError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (!confirm('Are you sure you want to upload this Excel file with employee data?')) {
      event.target.value = ''; // Reset file input
      return;
    }

    this.isLoading = true;
    this.orgService.uploadEmployeesExcel(file)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          event.target.value = ''; // Reset file input
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Bulk upload response:', response);
          const successCount = response.successfulRegistrations?.length || 0;
          const failedCount = response.failedRegistrations?.length || 0;
          
          if (successCount > 0) {
            this.showSuccess(`✅ ${successCount} employees registered successfully`);
          }
          if (failedCount > 0) {
            this.showError(`⚠️ ${failedCount} employees failed to register`);
          }
          
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Failed to upload employees:', error);
          this.showError(error.error?.message || 'Failed to upload employees');
        }
      });
  }

  // Payroll Management
  generatePayroll(month: string): void {
    if (!month) {
      this.showError('Please select a month');
      return;
    }

    if (!confirm(`Are you sure you want to generate payroll for ${month}?`)) {
      return;
    }

    this.isLoading = true;
    this.orgService.generatePayroll(month)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Payroll generated:', response);
          this.showSuccess(response.message || '✅ Payroll generated successfully');
        },
        error: (error) => {
          console.error('Failed to generate payroll:', error);
          this.showError(error.error?.message || 'Failed to generate payroll');
        }
      });
  }

  submitPayroll(month: string): void {
    if (!month) {
      this.showError('Please select a month');
      return;
    }

    if (!confirm(`Are you sure you want to submit payroll for ${month} to the bank?`)) {
      return;
    }

    this.isLoading = true;
    this.orgService.submitPayrollToBank(month)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Payroll submitted:', response);
          this.showSuccess(response.message || '✅ Payroll submitted to bank successfully');
        },
        error: (error) => {
          console.error('Failed to submit payroll:', error);
          this.showError(error.error?.message || 'Failed to submit payroll');
        }
      });
  }

  // Tab Navigation
  switchTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();

    // Load data specific to tab
    if (tab === 'concerns') {
      this.loadConcerns();
    } else if (tab === 'employees') {
      this.loadEmployees();
    }
  }

  // Utility Methods
  getProgress(): number {
    if (!this.onboardingStatus) return 0;
    
    let progress = 0;
    
    if (this.onboardingStatus.documentStage === 'APPROVED') {
      progress += 33;
    }
    if (this.onboardingStatus.bankStage === 'APPROVED') {
      progress += 33;
    }
    if (this.onboardingStatus.organizationStatus === 'ACTIVE') {
      progress += 34;
    }
    
    return progress;
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.autoHideMessages();
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.autoHideMessages();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  autoHideMessages(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      if (this.activeTab === 'templates') {
        this.loadSalaryTemplates();
      } else if (this.activeTab === 'concerns') {
        this.loadConcerns();
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      if (this.activeTab === 'templates') {
        this.loadSalaryTemplates();
      } else if (this.activeTab === 'concerns') {
        this.loadConcerns();
      }
    }
  }
}