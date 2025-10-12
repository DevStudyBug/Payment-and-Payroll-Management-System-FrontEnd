// admin-dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth-service';
import { BankAdminService } from '../../../core/services/bank-admin-service';
import { 
  BankAdminOrgRegisterResponse, 
  PaymentRequestList,
  PaymentRequestDetail,
  PaymentRequestPageResponse
} from '../../../core/models/response-model.models';
import { PaymentRequestFilter, RejectRequest } from '../../../core/models/request-model.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard-component.html',
  styleUrls: ['./admin-dashboard-component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  cdr = inject(ChangeDetectorRef);


  userEmail: string = '';
  userId: number = 0;
  userRoles: string[] = [];

  activeTab: string = 'overview';
  loading: boolean = false;

  // Organizations
  allOrganizations: BankAdminOrgRegisterResponse[] = [];
  filteredOrganizations: BankAdminOrgRegisterResponse[] = [];
  selectedOrganization: BankAdminOrgRegisterResponse | null = null;
  orgFilter: string = 'ALL';

  totalOrgCount: number = 0;
  pendingOrgCount: number = 0;
  underReviewOrgCount: number = 0;
  activeOrgCount: number = 0;
  rejectedOrgCount: number = 0;

  // Payments
  paymentRequests: PaymentRequestList[] = [];
  selectedPaymentRequest: PaymentRequestDetail | null = null;
  totalPaymentRequests: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;

  paymentFilters: PaymentRequestFilter = {
    page: 0,
    size: 10,
    sortBy: 'requestDate',
    sortDir: 'desc'
  };

  // Modal
  showRejectModal: boolean = false;
  rejectType: string = '';
  rejectReason: string = '';
  rejectTargetId: number = 0;
  rejectTargetDocId: number = 0;
  currentOrgId: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private bankAdminService: BankAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeUserInfo();
    this.loadDashboardData();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialize user
  private initializeUserInfo(): void {
    const authUserInfo = this.authService.getUserInfo();
    if (authUserInfo) {
      this.userEmail = authUserInfo.email;
      this.userId = authUserInfo.userId;
      this.userRoles = authUserInfo.roles;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Tab management
  switchTab(tab: string): void {
    this.activeTab = tab;
    this.selectedOrganization = null;
    this.selectedPaymentRequest = null;

    if (tab === 'organizations') {
      this.orgFilter = 'ALL';
      this.fetchAllOrganizations();
    } else if (tab === 'payment') {
      this.resetPaymentFilters();
    }
  }

  // Load initial data
  private loadDashboardData(): void {
    this.fetchAllOrganizations();
    this.fetchPaymentRequests();
  }

  // Organizations - FIXED with finalize
  private fetchAllOrganizations(): void {
    this.loading = true;
    console.log('Fetching organizations...');
    this.bankAdminService.getAllOrganizations()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false; // ✅ Always stops loading
          console.log('Loading finished');
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Organizations received:', data);
          this.allOrganizations = data || [];
          this.calculateStats();
          this.applyOrgFilter();
        },
        error: (err) => {
          console.error('Error fetching organizations:', err);
          this.allOrganizations = [];
          this.calculateStats();
          this.applyOrgFilter();
          this.showAlert('Failed to load organizations: ' + (err?.error?.message || err?.message || 'Unknown error'));
        }
      });
  }

  private calculateStats(): void {
    this.totalOrgCount = this.allOrganizations.length;
    this.pendingOrgCount = this.allOrganizations.filter(o => o.status === 'PENDING').length;
    this.underReviewOrgCount = this.allOrganizations.filter(o => o.status === 'UNDER_REVIEW').length;
    this.activeOrgCount = this.allOrganizations.filter(o => o.status === 'ACTIVE').length;
    this.rejectedOrgCount = this.allOrganizations.filter(o => o.status === 'REJECTED').length;
  }

  applyOrgFilter(): void {
    if (this.orgFilter === 'ALL') {
      this.filteredOrganizations = [...this.allOrganizations];
    } else {
      this.filteredOrganizations = this.allOrganizations.filter(org => org.status === this.orgFilter);
    }
  }

  changeOrgFilter(filter: string): void {
    this.orgFilter = filter;
    this.applyOrgFilter();
  }

  selectOrganization(org: BankAdminOrgRegisterResponse): void {
    this.selectedOrganization = org;
    this.currentOrgId = org.orgId;
  }

  verifyOrganization(orgId: number): void {
    if (!confirm('Verify this organization?')) return;
    this.loading = true;

    this.bankAdminService.verifyOrganization(orgId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res) => {
          this.showAlert('Organization verified');
          this.fetchAllOrganizations();
          this.selectedOrganization = null;
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to verify');
        }
      });
  }

  verifyDocument(docId: number): void {
    if (!this.selectedOrganization) return;
    this.loading = true;

    this.bankAdminService.verifyDocument(this.selectedOrganization.orgId, docId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.showAlert('Document verified');
          this.fetchAllOrganizations();
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to verify document');
        }
      });
  }

  verifyBankDetails(): void {
    if (!this.selectedOrganization) return;
    this.loading = true;

    this.bankAdminService.verifyBankDetails(this.selectedOrganization.orgId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.showAlert('Bank details verified');
          this.fetchAllOrganizations();
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to verify bank details');
        }
      });
  }

  // Payments - FIXED with finalize
  private fetchPaymentRequests(): void {
    // Don't show main loading spinner for background fetch
    this.bankAdminService.getFilteredPaymentRequests(this.paymentFilters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log('Payment requests fetch completed');
        })
      )
      .subscribe({
        next: (res) => {
          this.paymentRequests = res.content || [];
          this.totalPages = res.totalPages || 0;
          this.totalPaymentRequests = res.totalElements || 0;
        },
        error: (err) => {
          console.warn('Payment requests not available:', err);
          this.paymentRequests = [];
          this.totalPages = 0;
          this.totalPaymentRequests = 0;
        }
      });
  }

  selectPaymentRequest(paymentId: number): void {
    this.loading = true;
    this.bankAdminService.getPaymentRequestDetail(paymentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res) => {
          this.selectedPaymentRequest = res;
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to load payment details');
        }
      });
  }

  approvePayment(paymentId: number): void {
    if (!confirm('Approve this payment?')) return;
    this.loading = true;

    this.bankAdminService.approvePaymentRequest(paymentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.showAlert('Payment approved');
          this.fetchPaymentRequests();
          this.selectedPaymentRequest = null;
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to approve payment');
        }
      });
  }

  disbursePayment(paymentId: number): void {
    if (!confirm('Disburse this payment?')) return;
    this.loading = true;

    this.bankAdminService.disbursePayment(paymentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.showAlert('Payment disbursed');
          this.fetchPaymentRequests();
          this.selectedPaymentRequest = null;
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to disburse payment');
        }
      });
  }

  filterPayments(): void {
    this.currentPage = 0;
    this.paymentFilters.page = 0;
    this.fetchPaymentRequests();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.paymentFilters.page = this.currentPage;
      this.fetchPaymentRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.paymentFilters.page = this.currentPage;
      this.fetchPaymentRequests();
    }
  }

  private resetPaymentFilters(): void {
    this.paymentFilters = {
      page: 0,
      size: 10,
      sortBy: 'requestDate',
      sortDir: 'desc'
    };
    this.currentPage = 0;
    this.fetchPaymentRequests();
  }

  // Rejection Modal
  openRejectModal(type: string, targetId: number, docId: number = 0): void {
    this.rejectType = type;
    this.rejectTargetId = targetId;
    this.rejectTargetDocId = docId;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
  }

  submitReject(): void {
    if (!this.rejectReason.trim()) {
      this.showAlert('Please provide a reason');
      return;
    }

    this.loading = true;
    const handler = this.getRejectHandler();

    if (handler) {
      handler.pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
        .subscribe({
          next: () => {
            this.showAlert('Rejected successfully');
            this.closeRejectModal();
            this.refreshAfterAction();
          },
          error: (err: any) => {
            console.error(err);
            this.showAlert('Failed to reject');
          }
        });
    }
  }

  private getRejectHandler(): any {
    switch (this.rejectType) {
      case 'org':
        return this.bankAdminService.rejectOrganization(this.rejectTargetId, this.rejectReason);
      case 'document':
        return this.bankAdminService.rejectDocument(this.currentOrgId, this.rejectTargetDocId, this.rejectReason);
      case 'bank':
        return this.bankAdminService.rejectBankDetails(this.rejectTargetId, this.rejectReason);
      case 'payment':
        return this.bankAdminService.rejectPaymentRequest(this.rejectTargetId, { reason: this.rejectReason });
      default:
        return null;
    }
  }

  private refreshAfterAction(): void {
    if (this.rejectType === 'payment') {
      this.fetchPaymentRequests();
      this.selectedPaymentRequest = null;
    } else {
      this.fetchAllOrganizations();
      this.selectedOrganization = null;
    }
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'UNDER_REVIEW': 'badge-info',
      'ACTIVE': 'badge-success',
      'REJECTED': 'badge-danger',
      'APPROVED': 'badge-success'
    };
    return map[status] || 'badge-secondary';
  }

  private showAlert(msg: string): void {
    alert(msg);
  }
}