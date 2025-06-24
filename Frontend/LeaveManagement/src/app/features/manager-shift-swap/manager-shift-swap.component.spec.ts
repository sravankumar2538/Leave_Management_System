import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerShiftSwapComponent } from './manager-shift-swap.component';

describe('ManagerShiftSwapComponent', () => {
  let component: ManagerShiftSwapComponent;
  let fixture: ComponentFixture<ManagerShiftSwapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerShiftSwapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerShiftSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
