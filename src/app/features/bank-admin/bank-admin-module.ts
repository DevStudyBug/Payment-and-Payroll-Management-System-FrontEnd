import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankAdminRoutingModule } from './bank-admin-routing-module';

// Components must be declared, not imported
import { BankVerification } from './bank-verification/bank-verification';
import { DocumentVerification } from './document-verification/document-verification';
import { PendingOrganizations } from './pending-organizations/pending-organizations';
import { UnderReviewOrganizations } from './under-review-organizations/under-review-organizations';

@NgModule({
  declarations: [
    BankVerification,
    DocumentVerification,
    PendingOrganizations,
    UnderReviewOrganizations
  ],
  imports: [
    CommonModule,
    BankAdminRoutingModule,
    // Removed components from imports array
  ]
})
export class BankAdminModule {}
