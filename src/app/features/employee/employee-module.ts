import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRoutingModule } from './employee-routing-module';

// Components must be declared, not imported
import { BankDetails } from './bank-details/bank-details';
import { SalaryDisbursement } from './salary-disbursement/salary-disbursement';
import { SalaryTemplate } from './salary-template/salary-template';

@NgModule({
  declarations: [
    BankDetails,
    SalaryDisbursement,
    SalaryTemplate
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    // Removed components from imports array
  ]
})
export class EmployeeModule {}
