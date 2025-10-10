import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankDetails } from './bank-details/bank-details';
import { SalaryDisbursement } from './salary-disbursement/salary-disbursement';
import { SalaryTemplate } from './salary-template/salary-template';

const routes: Routes = [
  { path: 'bank-details', component: BankDetails },
  { path: 'salary-disbursement', component: SalaryDisbursement },
  { path: 'salary-template', component: SalaryTemplate },
  { path: '', redirectTo: 'bank-details', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {}
