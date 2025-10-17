import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationRoutingModule } from './organization-routing-module';

// Components must be declared, not imported
import { RegisterOrganization } from './registerOrganization/register-organization/register-organization';
import { UploadDocument } from './upload-document/upload-document';
import { ReviewStatus } from './review-status/review-status';
import { AddBankDetails } from './add-bank-details/add-bank-details';

@NgModule({
  declarations: [
    RegisterOrganization,
    UploadDocument,
    ReviewStatus,
    AddBankDetails
  ],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    // Removed components from imports array
  ]
})
export
 class OrganizationModule {}