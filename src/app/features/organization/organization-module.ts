import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationRoutingModule } from './organization-routing-module';

// ✅ standalone components imported
import { RegisterOrganization } from './registerOrganization/register-organization/register-organization';
import { UploadDocument } from './upload-document/upload-document';
import { ReviewStatus } from './review-status/review-status';
import { AddBankDetails } from './add-bank-details/add-bank-details';

@NgModule({
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    RegisterOrganization,
    UploadDocument,
    ReviewStatus,
    AddBankDetails
  ]
})
export class OrganizationModule {}
