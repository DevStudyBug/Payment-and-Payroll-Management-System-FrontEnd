import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryDisbursement } from './salary-disbursement';

describe('SalaryDisbursement', () => {
  let component: SalaryDisbursement;
  let fixture: ComponentFixture<SalaryDisbursement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryDisbursement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryDisbursement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
