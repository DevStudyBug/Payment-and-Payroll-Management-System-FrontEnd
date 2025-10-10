import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRoutingModule } from './employee-routing-module';

// ✅ standalone components imported
import { BankDetails } from './bank-details/bank-details';
import { SalaryDisbursement } from './salary-disbursement/salary-disbursement';
import { SalaryTemplate } from './salary-template/salary-template';

@NgModule({
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    BankDetails,
    SalaryDisbursement,
    SalaryTemplate
  ]
})
export class EmployeeModule {}
