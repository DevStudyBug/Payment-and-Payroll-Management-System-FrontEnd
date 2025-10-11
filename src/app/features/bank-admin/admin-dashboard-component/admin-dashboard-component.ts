// admin-dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { BankAdminService } from '../../../core/services/bank-admin-service';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // User Info
  userEmail: string = '';
  userId: number = 0;
  userRoles: string[] = [];

  // UI State
  activeTab: string = 'overview';
  loading: boolean = false;

  // Organization Data
  pendingOrganizations: any[] = [];
  underReviewOrganizations: any[] = [];
  selectedOrganization: any = null;

  // Payment Data
  paymentRequests: any[] = [];
  selectedPaymentRequest: any = null;
  paymentPageResponse: any = null;

  // Dashboard Stats
  pendingOrgCount: number = 0;
  activeOrgCount: number = 0;
  totalPaymentRequests: number = 0;

  // Filter & Pagination
  paymentFilters: any = {
    page: 0,
    size: 10,
    status: '',
    type: '',
    sortBy: 'requestDate',
    sortDir: 'desc'
  };

  currentPage: number = 0;
  totalPages: number = 0;

  // Modal State
  showRejectModal: boolean = false;
  rejectType: string = '';
  rejectReason: string = '';
  rejectTargetId: number = 0;
  rejectTargetDocId: number = 0;
  currentOrgId: number = 0;

  // Unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private bankAdminService: BankAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeUserInfo();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize user information from auth service
   */
  private initializeUserInfo(): void {
    const authUserInfo = this.authService.getUserInfo();
    if (authUserInfo) {
      this.userEmail = authUserInfo.email;
      this.userId = authUserInfo.userId;
      this.userRoles = authUserInfo.roles;
    }
  }

  /**
   * Load all dashboard data on initialization
   */
  private loadDashboardData(): void {
    this.fetchPendingOrganizations();
    this.fetchUnderReviewOrganizations();
    this.fetchPaymentRequests();
  }

  /**
   * Switch active tab and reset selections
   */
  switchTab(tab: string): void {
    this.activeTab = tab;
    this.selectedOrganization = null;
    this.selectedPaymentRequest = null;

    if (tab === 'organizations') {
      this.fetchPendingOrganizations();
    } else if (tab === 'payment') {
      this.resetFiltersAndFetch();
    }
  }

  // ===========================
  // ORGANIZATION METHODS
  // ===========================

  /**
   * Fetch pending organizations
   */
  private fetchPendingOrganizations(): void {
    this.loading = true;
    this.bankAdminService.getPendingOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.pendingOrganizations = data || [];
          this.pendingOrgCount = data?.length || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching pending organizations:', error);
          this.showAlert('Failed to load pending organizations');
          this.loading = false;
        }
      });
  }

  /**
   * Fetch under review organizations
   */
  private fetchUnderReviewOrganizations(): void {
    this.loading = true;
    this.bankAdminService.getUnderReviewOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.underReviewOrganizations = data || [];
          this.activeOrgCount = data?.length || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching under review organizations:', error);
          this.showAlert('Failed to load under review organizations');
          this.loading = false;
        }
      });
  }

  /**
   * Select organization and fetch details
   */
  selectOrganization(org: any): void {
    this.selectedOrganization = org;
    this.currentOrgId = org.orgId;
  }

  /**
   * Verify organization with confirmation
   */
  verifyOrganization(orgId: number): void {
    if (!confirm('Are you sure you want to verify this organization?')) return;

    this.loading = true;
    this.bankAdminService.verifyOrganization(orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showAlert(response.message || 'Organization verified successfully');
          this.fetchPendingOrganizations();
          this.selectedOrganization = null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error verifying organization:', error);
          this.showAlert('Failed to verify organization');
          this.loading = false;
        }
      });
  }

  /**
   * Verify document with confirmation
   */
  verifyDocument(docIndex: number): void {
    if (!this.selectedOrganization) return;
    if (!confirm('Are you sure you want to approve this document?')) return;

    this.loading = true;
    this.bankAdminService.verifyDocument(this.selectedOrganization.orgId, docIndex)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showAlert(response.message || 'Document verified successfully');
          this.fetchUnderReviewOrganizations();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error verifying document:', error);
          this.showAlert('Failed to verify document');
          this.loading = false;
        }
      });
  }

  /**
   * Verify bank details with confirmation
   */
  verifyBankDetails(): void {
    if (!this.selectedOrganization) return;
    if (!confirm('Are you sure you want to approve these bank details?')) return;

    this.loading = true;
    this.bankAdminService.verifyBankDetails(this.selectedOrganization.orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showAlert(response.message || 'Bank details verified successfully');
          this.fetchUnderReviewOrganizations();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error verifying bank details:', error);
          this.showAlert('Failed to verify bank details');
          this.loading = false;
        }
      });
  }

  // ===========================
  // PAYMENT REQUEST METHODS
  // ===========================

  /**
   * Fetch payment requests with current filters
   */
  private fetchPaymentRequests(): void {
    this.loading = true;
    this.bankAdminService.getFilteredPaymentRequests(this.paymentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.paymentPageResponse = response;
          this.paymentRequests = response.content || [];
          this.totalPages = response.totalPages || 0;
          this.totalPaymentRequests = response.totalElements || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching payment requests:', error);
          this.showAlert('Failed to load payment requests');
          this.totalPaymentRequests = 0;
          this.paymentRequests = [];
          this.loading = false;
        }
      });
  }

  /**
   * Select payment request and fetch details
   */
  selectPaymentRequest(paymentId: number): void {
    this.loading = true;
    this.bankAdminService.getPaymentRequestDetail(paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.selectedPaymentRequest = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching payment request:', error);
          this.showAlert('Failed to load payment request details');
          this.loading = false;
        }
      });
  }

  /**
   * Approve payment with confirmation
   */
  approvePayment(paymentId: number): void {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    this.loading = true;
    this.bankAdminService.approvePaymentRequest(paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showAlert(response.message || 'Payment approved successfully');
          this.fetchPaymentRequests();
          this.selectedPaymentRequest = null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error approving payment:', error);
          this.showAlert('Failed to approve payment');
          this.loading = false;
        }
      });
  }

  /**
   * Disburse payment with confirmation
   */
  disbursePayment(paymentId: number): void {
    if (!confirm('Are you sure you want to disburse this payment?')) return;

    this.loading = true;
    this.bankAdminService.disbursePayment(paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showAlert(response.message || 'Payment disbursed successfully');
          this.fetchPaymentRequests();
          this.selectedPaymentRequest = null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error disbursing payment:', error);
          this.showAlert('Failed to disburse payment');
          this.loading = false;
        }
      });
  }

  /**
   * Apply payment filters and reset pagination
   */
  filterPaymentRequests(): void {
    this.resetFiltersAndFetch();
  }

  /**
   * Reset filters and fetch fresh data
   */
  private resetFiltersAndFetch(): void {
    this.paymentFilters.page = 0;
    this.currentPage = 0;
    this.fetchPaymentRequests();
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.paymentFilters.page = this.currentPage;
      this.fetchPaymentRequests();
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.paymentFilters.page = this.currentPage;
      this.fetchPaymentRequests();
    }
  }

  // ===========================
  // MODAL METHODS
  // ===========================

  /**
   * Open rejection modal
   */
  openRejectModal(type: string, targetId: number, docId: number = 0): void {
    this.rejectType = type;
    this.rejectTargetId = targetId;
    this.rejectTargetDocId = docId;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  /**
   * Close rejection modal
   */
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectReason = '';
    this.rejectType = '';
  }

  /**
   * Submit rejection
   */
  submitReject(): void {
    if (!this.rejectReason.trim()) {
      this.showAlert('Please provide a rejection reason');
      return;
    }

    this.loading = true;

    const rejectHandler = this.getRejectHandler();
    if (rejectHandler) {
      rejectHandler.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.showAlert(response.message || 'Rejected successfully');
          this.closeRejectModal();
          this.refreshAfterReject();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error rejecting:', error);
          this.showAlert('Failed to reject');
          this.loading = false;
        }
      });
    }
  }

  /**
   * Get appropriate reject handler based on type
   */
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

  /**
   * Refresh data after rejection
   */
  private refreshAfterReject(): void {
    switch (this.rejectType) {
      case 'org':
        this.fetchPendingOrganizations();
        break;
      case 'document':
      case 'bank':
        this.fetchUnderReviewOrganizations();
        break;
      case 'payment':
        this.fetchPaymentRequests();
        break;
    }
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  /**
   * Get badge class based on status
   */
  getStatusClass(status: string): string {
    if (!status) return 'badge-secondary';

    const normalizedStatus = status.toUpperCase();
    const statusMap: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-success',
      'VERIFIED': 'badge-success',
      'ACTIVE': 'badge-success',
      'REJECTED': 'badge-danger',
      'UNDER_REVIEW': 'badge-info'
    };

    return statusMap[normalizedStatus] || 'badge-secondary';
  }

  /**
   * Show alert message
   */
  private showAlert(message: string): void {
    alert(message);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}