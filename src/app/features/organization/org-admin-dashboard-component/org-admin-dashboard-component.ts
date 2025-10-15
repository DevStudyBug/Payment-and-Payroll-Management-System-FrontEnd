// org-admin-dashboard-component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
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

  // Modal States
  showDocumentModal = false;
  showBankModal = false;

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
  documentUploadForm!: FormGroup;
  bankDetailsForm!: FormGroup;

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

    // Document Upload Form with FormArray for multiple documents
    this.documentUploadForm = this.fb.group({
      documents: this.fb.array([this.createDocumentFormGroup()])
    });

    // Bank Details Form
    this.bankDetailsForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.minLength(9)]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      bankName: ['', [Validators.required, Validators.minLength(3)]],
      accountHolderName: ['', [Validators.required, Validators.minLength(3)]],
      branchName: ['', Validators.minLength(3)]
    });
  }

  // Create a single document form group
  createDocumentFormGroup(): FormGroup {
    return this.fb.group({
      file: [null, Validators.required],
      fileName: ['', Validators.required],
      fileType: ['', Validators.required]
    });
  }

  // Get documents form array
  get documentsArray(): FormArray {
    return this.documentUploadForm.get('documents') as FormArray;
  }

  // Add document field
  addDocumentField(): void {
    this.documentsArray.push(this.createDocumentFormGroup());
  }

  // Remove document field
  removeDocumentField(index: number): void {
    if (this.documentsArray.length > 1) {
      this.documentsArray.removeAt(index);
    }
  }

  // Handle file selection
  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.documentsArray.at(index).patchValue({ file: file });
    }
  }

  // Load Onboarding Status
  loadOnboardingStatus(): void {
    this.isLoading = true;
    this.orgService.getOnboardingStatus()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          console.log('Onboarding Status:', data);
          this.onboardingStatus = data;
          
          // Load other data only if onboarding is complete
          if (this.isOnboardingComplete()) {
            this.loadDesignations();
            this.loadSalaryTemplates();
            this.loadEmployees();
          }
        },
        error: (error) => {
          console.error('Failed to load onboarding status', error);
          this.showError('Failed to load onboarding status');
        }
      });
  }

  loadDesignations(): void {
    this.orgService.getAllDesignations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.designations = data || [];
        },
        error: (error) => {
          console.error('Failed to load designations', error);
        }
      });
  }

  loadSalaryTemplates(): void {
    this.orgService.getAllSalaryTemplates(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.salaryTemplates = data.content || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        },
        error: (error) => {
          console.error('Failed to load salary templates', error);
        }
      });
  }

  loadEmployees(status: string = 'ALL'): void {
    this.orgService.getEmployeesByStatus(status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.employees = data || [];
        },
        error: (error) => {
          console.error('Failed to load employees', error);
        }
      });
  }

  loadConcerns(): void {
    this.orgService.getAllConcerns(undefined, undefined, undefined, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.concerns = data.content || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        },
        error: (error) => {
          console.error('Failed to load concerns', error);
        }
      });
  }

  // Document Upload
  openDocumentModal(): void {
    this.showDocumentModal = true;
    // Reset form
    this.documentUploadForm = this.fb.group({
      documents: this.fb.array([this.createDocumentFormGroup()])
    });
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
  }

  uploadDocuments(): void {
    if (this.documentUploadForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (!confirm('Are you sure you want to upload these documents?')) {
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const metaArray: any[] = [];

    // Build FormData and meta array
    this.documentsArray.controls.forEach((control, index) => {
      const file = control.get('file')?.value;
      const fileName = control.get('fileName')?.value;
      const fileType = control.get('fileType')?.value;

      if (file) {
        formData.append('file', file);
        metaArray.push({ fileName, fileType });
      }
    });

    // Append meta as JSON string
    formData.append('meta', JSON.stringify(metaArray));

    this.orgService.uploadDocument(
      this.documentsArray.controls.map(c => c.get('file')?.value).filter(f => f),
      metaArray
    )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Documents uploaded:', response);
          this.showSuccess('✅ Documents uploaded successfully');
          this.closeDocumentModal();
          this.loadOnboardingStatus();
        },
        error: (error) => {
          console.error('Failed to upload documents:', error);
          this.showError(error.error?.message || 'Failed to upload documents');
        }
      });
  }

  // Bank Details Submission
  openBankModal(): void {
    this.showBankModal = true;
    this.bankDetailsForm.reset();
  }

  closeBankModal(): void {
    this.showBankModal = false;
  }

  submitBankDetails(): void {
    if (this.bankDetailsForm.invalid) {
      this.showError('Please fill all required bank details correctly');
      return;
    }

    if (!confirm('Are you sure you want to submit these bank details?')) {
      return;
    }

    this.isLoading = true;
    const bankData = this.bankDetailsForm.value;

    // Determine if it's first submission or reupload
    const isReupload = this.onboardingStatus?.bankStage === 'REJECTED';
    const apiCall = isReupload 
      ? this.orgService.reuploadBankDetails(bankData)
      : this.orgService.addBankDetails(bankData);

    apiCall
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Bank details submitted:', response);
          this.showSuccess('✅ Bank details submitted successfully');
          this.closeBankModal();
          this.loadOnboardingStatus();
        },
        error: (error) => {
          console.error('Failed to submit bank details:', error);
          this.showError(error.error?.message || 'Failed to submit bank details');
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
          this.showSuccess('✅ Designation added successfully');
          this.designationForm.reset();
          this.loadDesignations();
        },
        error: (error) => {
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
          this.showSuccess('✅ Salary template created successfully');
          this.salaryTemplateForm.reset();
          this.loadSalaryTemplates();
        },
        error: (error) => {
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
          this.showSuccess(`✅ Employee registered successfully. Username: ${response.username}`);
          this.employeeForm.reset();
          this.loadEmployees();
        },
        error: (error) => {
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
      event.target.value = '';
      return;
    }

    this.isLoading = true;
    this.orgService.uploadEmployeesExcel(file)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          event.target.value = '';
        })
      )
      .subscribe({
        next: (response) => {
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
          this.showSuccess(response.message || '✅ Payroll generated successfully');
        },
        error: (error) => {
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
          this.showSuccess(response.message || '✅ Payroll submitted to bank successfully');
        },
        error: (error) => {
          this.showError(error.error?.message || 'Failed to submit payroll');
        }
      });
  }

  // Tab Navigation
  switchTab(tab: string): void {
    // Check if onboarding is complete for restricted tabs
    if (!this.isOnboardingComplete() && tab !== 'dashboard') {
      this.showError('Complete your onboarding (100%) to access this feature');
      return;
    }

    this.activeTab = tab;
    this.clearMessages();

    // Load data specific to tab
    if (tab === 'concerns') {
      this.loadConcerns();
    } else if (tab === 'employees') {
      this.loadEmployees();
    } else if (tab === 'templates') {
      this.loadSalaryTemplates();
    } else if (tab === 'designations') {
      this.loadDesignations();
    }
  }

  // Utility Methods
  getProgress(): number {
    if (!this.onboardingStatus) return 0;
    
    let progress = 0;
    if (this.onboardingStatus.documentStage === 'APPROVED') progress += 50;
    if (this.onboardingStatus.bankStage === 'APPROVED') progress += 50;
    
    return progress;
  }

  isOnboardingComplete(): boolean {
    return this.getProgress() === 100;
  }

  canAccessFeature(): boolean {
    return this.isOnboardingComplete();
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