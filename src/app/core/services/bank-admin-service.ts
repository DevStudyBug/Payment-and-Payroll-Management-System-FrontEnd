import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAdminOrgRegisterResponse, OrganizationOnboardingStatus, PaymentRequestDetail, PaymentRequestPageResponse, PayrollActionResponse } from '../models/response-model.models';
import { PaymentRequestFilter, RejectRequest } from '../models/request-model.models';


@Injectable({
  providedIn: 'root'
})
export class BankAdminService {
  private apiUrl = 'http://localhost:8080/api/v1/bank-admin';

  constructor(private http: HttpClient) {}

  // ===========================
  // ORGANIZATION ENDPOINTS
  // ===========================

  getPendingOrganizations(): Observable<BankAdminOrgRegisterResponse[]> {
    return this.http.get<BankAdminOrgRegisterResponse[]>(
      `${this.apiUrl}/organizations/pending`
    );
  }

  getUnderReviewOrganizations(): Observable<BankAdminOrgRegisterResponse[]> {
    return this.http.get<BankAdminOrgRegisterResponse[]>(
      `${this.apiUrl}/organizations/under-review`
    );
  }

  verifyOrganization(orgId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/organizations/${orgId}/verify`,
      {}
    );
  }

  rejectOrganization(orgId: number, reason: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/organizations/${orgId}/reject`,
      { reason }
    );
  }

  // ===========================
  // DOCUMENT ENDPOINTS
  // ===========================

  verifyDocument(orgId: number, docId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/organizations/${orgId}/documents/${docId}/verify`,
      {}
    );
  }

  rejectDocument(orgId: number, docId: number, reason: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/organizations/${orgId}/documents/${docId}/reject`,
      { reason }
    );
  }

  // ===========================
  // BANK DETAILS ENDPOINTS
  // ===========================

  verifyBankDetails(orgId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/organizations/${orgId}/bank/verify`,
      {}
    );
  }

  rejectBankDetails(orgId: number, reason: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/organizations/${orgId}/bank/reject`,
      { reason }
    );
  }

  // ===========================
  // PAYMENT REQUEST ENDPOINTS
  // ===========================

  getFilteredPaymentRequests(filter: PaymentRequestFilter): Observable<PaymentRequestPageResponse> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('size', filter.size.toString())
      .set('sortBy', filter.sortBy)
      .set('sortDir', filter.sortDir);

    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.type) {
      params = params.set('type', filter.type);
    }
    if (filter.orgId) {
      params = params.set('orgId', filter.orgId.toString());
    }
    if (filter.startDate) {
      params = params.set('startDate', filter.startDate.toISOString());
    }
    if (filter.endDate) {
      params = params.set('endDate', filter.endDate.toISOString());
    }

    return this.http.get<PaymentRequestPageResponse>(
      `${this.apiUrl}/requests`,
      { params }
    );
  }

  getPaymentRequestDetail(paymentRequestId: number): Observable<PaymentRequestDetail> {
    return this.http.get<PaymentRequestDetail>(
      `${this.apiUrl}/requests/${paymentRequestId}`
    );
  }

  approvePaymentRequest(paymentRequestId: number): Observable<PayrollActionResponse> {
    return this.http.put<PayrollActionResponse>(
      `${this.apiUrl}/approve/${paymentRequestId}`,
      {}
    );
  }

  rejectPaymentRequest(
    paymentRequestId: number,
    rejectRequest: RejectRequest
  ): Observable<PayrollActionResponse> {
    return this.http.put<PayrollActionResponse>(
      `${this.apiUrl}/reject/${paymentRequestId}`,
      rejectRequest
    );
  }

  disbursePayment(paymentRequestId: number): Observable<PayrollActionResponse> {
    return this.http.put<PayrollActionResponse>(
      `${this.apiUrl}/disburse/${paymentRequestId}`,
      {}
    );
  }

  // ===========================
  // ORGANIZATION ONBOARDING STATUS
  // ===========================

  getOrganizationOnboardingStatus(orgId: number): Observable<OrganizationOnboardingStatus> {
    return this.http.get<OrganizationOnboardingStatus>(
      `${this.apiUrl}/organizations/${orgId}/onboarding-status`
    );
  }
}