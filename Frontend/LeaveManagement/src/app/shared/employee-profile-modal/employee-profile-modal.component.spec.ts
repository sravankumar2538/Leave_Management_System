import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileModalComponent } from './employee-profile-modal.component';

describe('EmployeeProfileModalComponent', () => {
  let component: EmployeeProfileModalComponent;
  let fixture: ComponentFixture<EmployeeProfileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeProfileModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
