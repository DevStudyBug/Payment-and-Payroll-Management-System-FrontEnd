import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingOrganizations } from './pending-organizations';

describe('PendingOrganizations', () => {
  let component: PendingOrganizations;
  let fixture: ComponentFixture<PendingOrganizations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingOrganizations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingOrganizations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
