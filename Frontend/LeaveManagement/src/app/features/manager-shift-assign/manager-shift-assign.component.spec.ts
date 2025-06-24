import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerShiftAssignComponent } from './manager-shift-assign.component';

describe('ManagerShiftAssignComponent', () => {
  let component: ManagerShiftAssignComponent;
  let fixture: ComponentFixture<ManagerShiftAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerShiftAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerShiftAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
