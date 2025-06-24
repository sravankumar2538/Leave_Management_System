import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAttendanceReportComponent } from './employee-attendance-report.component';

describe('EmployeeAttendanceReportComponent', () => {
  let component: EmployeeAttendanceReportComponent;
  let fixture: ComponentFixture<EmployeeAttendanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAttendanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAttendanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
