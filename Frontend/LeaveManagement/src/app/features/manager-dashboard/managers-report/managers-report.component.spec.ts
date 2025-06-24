import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagersReportComponent } from './managers-report.component';

describe('ManagersReportComponent', () => {
  let component: ManagersReportComponent;
  let fixture: ComponentFixture<ManagersReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagersReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
