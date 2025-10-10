import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryTemplate } from './salary-template';

describe('SalaryTemplate', () => {
  let component: SalaryTemplate;
  let fixture: ComponentFixture<SalaryTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryTemplate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
