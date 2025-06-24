import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestStatusComponent } from './employee-leave-request-status.component';

describe('EmployeeLeaveRequestStatusComponent', () => {
  let component: EmployeeLeaveRequestStatusComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeLeaveRequestStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
