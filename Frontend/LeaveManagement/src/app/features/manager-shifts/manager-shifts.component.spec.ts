import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerShiftsComponent } from './manager-shifts.component';

describe('ManagerShiftsComponent', () => {
  let component: ManagerShiftsComponent;
  let fixture: ComponentFixture<ManagerShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
