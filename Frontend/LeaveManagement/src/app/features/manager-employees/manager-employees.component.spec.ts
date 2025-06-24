import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerEmployeesComponent } from './manager-employees.component';

describe('ManagerEmployeesComponent', () => {
  let component: ManagerEmployeesComponent;
  let fixture: ComponentFixture<ManagerEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
