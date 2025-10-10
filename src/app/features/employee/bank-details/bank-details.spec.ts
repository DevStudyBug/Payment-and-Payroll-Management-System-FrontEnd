import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankDetails } from './bank-details';

describe('BankDetails', () => {
  let component: BankDetails;
  let fixture: ComponentFixture<BankDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
