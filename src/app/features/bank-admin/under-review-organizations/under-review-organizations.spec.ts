import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderReviewOrganizations } from './under-review-organizations';

describe('UnderReviewOrganizations', () => {
  let component: UnderReviewOrganizations;
  let fixture: ComponentFixture<UnderReviewOrganizations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderReviewOrganizations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderReviewOrganizations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
