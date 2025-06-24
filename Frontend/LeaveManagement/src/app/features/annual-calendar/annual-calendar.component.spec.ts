import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualCalendarComponent } from './annual-calendar.component';

describe('AnnualCalendarComponent', () => {
  let component: AnnualCalendarComponent;
  let fixture: ComponentFixture<AnnualCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
