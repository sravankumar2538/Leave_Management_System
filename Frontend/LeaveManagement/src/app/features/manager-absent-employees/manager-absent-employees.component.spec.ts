import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerAbsentEmployeesComponent } from './manager-absent-employees.component';

describe('ManagerAbsentEmployeesComponent', () => {
  let component: ManagerAbsentEmployeesComponent;
  let fixture: ComponentFixture<ManagerAbsentEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerAbsentEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerAbsentEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
