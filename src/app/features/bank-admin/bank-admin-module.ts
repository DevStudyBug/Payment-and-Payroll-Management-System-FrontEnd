import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankAdminRoutingModule } from './bank-admin-routing-module';

// ✅ standalone components imported (not declared)
import { BankVerification } from './bank-verification/bank-verification';
import { DocumentVerification } from './document-verification/document-verification';
import { PendingOrganizations } from './pending-organizations/pending-organizations';
import { UnderReviewOrganizations } from './under-review-organizations/under-review-organizations';

@NgModule({
  imports: [
    CommonModule,
    BankAdminRoutingModule,
    BankVerification,
    DocumentVerification,
    PendingOrganizations,
    UnderReviewOrganizations
  ]
})
export class BankAdminModule {}
