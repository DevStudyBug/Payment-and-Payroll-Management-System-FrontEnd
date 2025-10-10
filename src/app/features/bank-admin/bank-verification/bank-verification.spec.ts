import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankVerification } from './bank-verification';

describe('BankVerification', () => {
  let component: BankVerification;
  let fixture: ComponentFixture<BankVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
