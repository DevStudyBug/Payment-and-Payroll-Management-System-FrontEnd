import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBankDetails } from './add-bank-details';

describe('AddBankDetails', () => {
  let component: AddBankDetails;
  let fixture: ComponentFixture<AddBankDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBankDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBankDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
