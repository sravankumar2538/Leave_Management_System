import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayAttendanceComponent } from './today-attendance.component';

describe('TodayAttendanceComponent', () => {
  let component: TodayAttendanceComponent;
  let fixture: ComponentFixture<TodayAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
