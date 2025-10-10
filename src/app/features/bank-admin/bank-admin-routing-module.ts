import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankVerification } from './bank-verification/bank-verification';
import { DocumentVerification } from './document-verification/document-verification';
import { PendingOrganizations } from './pending-organizations/pending-organizations';
import { UnderReviewOrganizations } from './under-review-organizations/under-review-organizations';

const routes: Routes = [
  { path: 'bank-verification', component: BankVerification },
  { path: 'document-verification', component: DocumentVerification },
  { path: 'pending-organizations', component: PendingOrganizations },
  { path: 'under-review-organizations', component: UnderReviewOrganizations },
  { path: '', redirectTo: 'bank-verification', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankAdminRoutingModule {}
