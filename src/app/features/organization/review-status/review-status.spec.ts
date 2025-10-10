import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewStatus } from './review-status';

describe('ReviewStatus', () => {
  let component: ReviewStatus;
  let fixture: ComponentFixture<ReviewStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
