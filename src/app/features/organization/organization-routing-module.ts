import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterOrganization } from './registerOrganization/register-organization/register-organization';
import { UploadDocument } from './upload-document/upload-document';
import { ReviewStatus } from './review-status/review-status';
import { AddBankDetails } from './add-bank-details/add-bank-details';

const routes: Routes = [
  { path: 'register', component: RegisterOrganization },
  { path: 'upload-document', component: UploadDocument },
  { path: 'review-status', component: ReviewStatus },
  { path: 'add-bank-details', component: AddBankDetails },
  { path: '', redirectTo: 'register', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {}
