import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BankAdminOrgRegisterResponse, PaymentRequestDetail, PaymentRequestList, PaymentRequestPageResponse } from '../../../core/models/response-model.models';
import { PaymentRequestFilter, RejectRequest } from '../../../core/models/request-model.models';
import { BankAdminService } from '../../../core/services/bank-admin-service';


@Component({
  selector: 'app-admin-dashboard-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.css'
})

export class AdminDashboardComponent implements OnInit {
  userEmail: string = '';
  userId: number = 0;
  userRoles: string[] = [];

  // Dashboard State
  activeTab: string = 'overview';

  // Organization Management
  pendingOrganizations: any[] = [];
  underReviewOrganizations: any[] = [];
  selectedOrganization: any = null;

  // Payment Request Management
  paymentRequests: any[] = [];
  selectedPaymentRequest: any = null;
  paymentPageResponse: any = null;

  // Filters
  paymentFilters: any = {
    page: 0,
    size: 10,
    sortBy: 'requestDate',
    sortDir: 'desc',
    status: '',
    type: '',
    orgId: null
  };

  // UI State
  loading: boolean = false;
  showRejectModal: boolean = false;
  rejectReason: string = '';
  rejectType: string = '';
  rejectTargetId: number = 0;
  rejectTargetDocId: number = 0;
  currentOrgId: number = 0;

  // Dashboard Stats
  totalOrganizations: number = 0;
  pendingOrgCount: number = 0;
  activeOrgCount: number = 0;
  totalPaymentRequests: number = 0;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bankAdminService: BankAdminService
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.userEmail = userInfo.email;
      this.userId = userInfo.userId;
      this.userRoles = userInfo.roles;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.fetchPendingOrganizations();
    this.fetchUnderReviewOrganizations();
    this.fetchPaymentRequests();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.selectedOrganization = null;
    this.selectedPaymentRequest = null;

    if (tab === 'organizations') {
      this.fetchPendingOrganizations();
    } else if (tab === 'payment') {
      this.fetchPaymentRequests();
    }
  }

  // ===========================
  // ORGANIZATION METHODS
  // ===========================

  fetchPendingOrganizations(): void {
    this.loading = true;
    this.bankAdminService.getPendingOrganizations().subscribe({
      next: (data: any) => {
        this.pendingOrganizations = data || [];
        this.pendingOrgCount = (data || []).length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching pending organizations:', err);
        this.pendingOrgCount = 0;
        this.loading = false;
      }
    });
  }

  fetchUnderReviewOrganizations(): void {
    this.loading = true;
    this.bankAdminService.getUnderReviewOrganizations().subscribe({
      next: (data: any) => {
        this.underReviewOrganizations = data || [];
        this.activeOrgCount = (data || []).length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching under review organizations:', err);
        this.activeOrgCount = 0;
        this.loading = false;
      }
    });
  }

  selectOrganization(org: any): void {
    this.selectedOrganization = org;
    this.currentOrgId = org.orgId;
    this.fetchUnderReviewOrganizations();
  }

  verifyOrganization(orgId: number): void {
    if (confirm('Are you sure you want to verify this organization?')) {
      this.loading = true;
      this.bankAdminService.verifyOrganization(orgId).subscribe({
        next: (response: any) => {
          alert(response.message || 'Organization verified successfully');
          this.fetchPendingOrganizations();
          this.selectedOrganization = null;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error verifying organization:', err);
          alert('Error verifying organization');
          this.loading = false;
        }
      });
    }
  }

  openRejectModal(type: string, targetId: number, docId: number = 0): void {
    this.rejectType = type;
    this.rejectTargetId = targetId;
    this.rejectTargetDocId = docId;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  submitReject(): void {
    if (!this.rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    this.loading = true;

    switch (this.rejectType) {
      case 'org':
        this.bankAdminService.rejectOrganization(this.rejectTargetId, this.rejectReason).subscribe({
          next: (response: any) => {
            alert(response.message || 'Organization rejected');
            this.closeRejectModal();
            this.fetchPendingOrganizations();
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error rejecting organization:', err);
            this.loading = false;
          }
        });
        break;

      case 'document':
        this.bankAdminService.rejectDocument(this.currentOrgId, this.rejectTargetDocId, this.rejectReason).subscribe({
          next: (response: any) => {
            alert(response.message || 'Document rejected');
            this.closeRejectModal();
            this.fetchUnderReviewOrganizations();
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error rejecting document:', err);
            this.loading = false;
          }
        });
        break;

      case 'bank':
        this.bankAdminService.rejectBankDetails(this.rejectTargetId, this.rejectReason).subscribe({
          next: (response: any) => {
            alert(response.message || 'Bank details rejected');
            this.closeRejectModal();
            this.fetchUnderReviewOrganizations();
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error rejecting bank details:', err);
            this.loading = false;
          }
        });
        break;

      case 'payment':
        const rejectRequest: any = { reason: this.rejectReason };
        this.bankAdminService.rejectPaymentRequest(this.rejectTargetId, rejectRequest).subscribe({
          next: (response: any) => {
            alert(response.message || 'Payment request rejected');
            this.closeRejectModal();
            this.fetchPaymentRequests();
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error rejecting payment request:', err);
            this.loading = false;
          }
        });
        break;
    }
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectReason = '';
    this.rejectType = '';
  }

  verifyDocument(docId: number): void {
    if (!this.selectedOrganization) return;
    
    if (confirm('Are you sure you want to approve this document?')) {
      this.loading = true;
      this.bankAdminService.verifyDocument(this.selectedOrganization.orgId, docId).subscribe({
        next: (response: any) => {
          alert(response.message || 'Document verified');
          this.fetchUnderReviewOrganizations();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error verifying document:', err);
          this.loading = false;
        }
      });
    }
  }

  verifyBankDetails(): void {
    if (!this.selectedOrganization) return;
    
    if (confirm('Are you sure you want to approve these bank details?')) {
      this.loading = true;
      this.bankAdminService.verifyBankDetails(this.selectedOrganization.orgId).subscribe({
        next: (response: any) => {
          alert(response.message || 'Bank details verified');
          this.fetchUnderReviewOrganizations();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error verifying bank details:', err);
          this.loading = false;
        }
      });
    }
  }

  // ===========================
  // PAYMENT REQUEST METHODS
  // ===========================

  fetchPaymentRequests(): void {
    this.loading = true;
    this.bankAdminService.getFilteredPaymentRequests(this.paymentFilters).subscribe({
      next: (response: any) => {
        this.paymentPageResponse = response;
        this.paymentRequests = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalPaymentRequests = response.totalElements || 0;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching payment requests:', err);
        this.totalPaymentRequests = 0;
        this.paymentRequests = [];
        this.loading = false;
      }
    });
  }

  selectPaymentRequest(paymentId: number): void {
    this.loading = true;
    this.bankAdminService.getPaymentRequestDetail(paymentId).subscribe({
      next: (response: any) => {
        this.selectedPaymentRequest = response;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching payment request detail:', err);
        this.loading = false;
      }
    });
  }

  approvePayment(paymentId: number): void {
    if (confirm('Are you sure you want to approve this payment?')) {
      this.loading = true;
      this.bankAdminService.approvePaymentRequest(paymentId).subscribe({
        next: (response: any) => {
          alert(response.message || 'Payment request approved');
          this.fetchPaymentRequests();
          this.selectedPaymentRequest = null;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error approving payment:', err);
          this.loading = false;
        }
      });
    }
  }

  disbursePayment(paymentId: number): void {
    if (confirm('Are you sure you want to disburse this payment?')) {
      this.loading = true;
      this.bankAdminService.disbursePayment(paymentId).subscribe({
        next: (response: any) => {
          alert(response.message || 'Payment disbursed successfully');
          this.fetchPaymentRequests();
          this.selectedPaymentRequest = null;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error disbursing payment:', err);
          this.loading = false;
        }
      });
    }
  }

  filterPaymentRequests(): void {
    this.paymentFilters.page = 0;
    this.currentPage = 0;
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

  // ===========================
  // HELPER METHODS
  // ===========================

  getStatusClass(status: string): string {
    if (!status) return 'badge-secondary';
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'badge-warning';
      case 'APPROVED':
      case 'VERIFIED':
      case 'ACTIVE':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-danger';
      case 'UNDER_REVIEW':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}