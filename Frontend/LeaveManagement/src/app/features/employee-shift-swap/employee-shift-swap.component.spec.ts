import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeShiftSwapComponent } from './employee-shift-swap.component';

describe('EmployeeShiftSwapComponent', () => {
  let component: EmployeeShiftSwapComponent;
  let fixture: ComponentFixture<EmployeeShiftSwapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeShiftSwapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeShiftSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
