import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EmployeeService } from '../Employee/employee.service';
import { EmployeeListResponseDTO } from '../Employee/Dtos/EmployeeListResponse-payload.dto';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiResponse } from '../../shared/api-response.interface';
import { AssignShiftRequestDTO } from '../Shifts/dtos/AssignShiftRequestDto';
import { EmployeeShiftService } from '../Shifts/shifts.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manager-shift-assign',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './manager-shift-assign.component.html',
  styleUrl: './manager-shift-assign.component.css'
})
export class ManagerShiftAssignComponent implements OnInit, OnDestroy {
  employeeResponseData: EmployeeListResponseDTO[] = [];
  selectedEmployeeId: number | null = null; // Stays null initially
  selectedDate: string | null = null; // Stays null initially
  selectedShiftTime: string | null = null; // Stays null initially

  private readonly destroy$ = new Subject<void>();

  @ViewChild('assignShiftFormRef') assignShiftFormRef!: NgForm;

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly employeeShiftService: EmployeeShiftService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getEmployeeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getEmployeeData(): void {
    this.employeeService.getAllEmployeesByManager().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ApiResponse<EmployeeListResponseDTO[]>) => {
        if (response.isSuccess && response.data) {
          this.employeeResponseData = response.data;

        } else {
          this.toastrService.warning(response.message || 'Failed to load employee data.');
        }
      },
      error: (error: any) => {
        let errorMessage = 'Error loading employees. Please try again later.';
        if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            errorMessage = (error.error).message;
        } else if (error.status === 0) {
            errorMessage = 'Network error: Could not connect to the server.';
        }
        this.toastrService.error(errorMessage);
      }
    });
  }

  AssignShifts(): void {
    this.assignShiftFormRef.control.markAllAsTouched();

    if (this.assignShiftFormRef.invalid) {
      this.toastrService.warning('Please fill all required fields correctly before assigning a shift.');
      return;
    }

    const shiftAssignmentPayload: AssignShiftRequestDTO = {
      employeeId: this.selectedEmployeeId!,
      shiftDate: this.selectedDate!,
      shiftTime: this.selectedShiftTime!
    };


    this.employeeShiftService.AssignShifts(shiftAssignmentPayload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ApiResponse<string>) => {
        if (response.isSuccess) {
          this.toastrService.success(response.message, "Success");
          this.resetForm();
        } else {
          this.toastrService.error(response.message || 'Failed to assign shift. Please try again.', "Error");
        }
      },
      error: (error: any) => {
        let errorMessage = 'An error occurred during shift assignment. Please try again.';

        if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            errorMessage = (error.error).message;
        } else if (error.status === 0) {
            errorMessage = 'Network error: Could not connect to the server.';
        } else if (typeof error.error === 'string' && error.error.trim() !== '') {
            errorMessage = error.error;
        } else {
            errorMessage = `Server Error (${error.status}): ${error.statusText ?? 'Unknown error occurred.'}`;
        }

        this.toastrService.error(errorMessage,"Error");
      }
    });
  }

  private resetForm(): void {
    this.selectedEmployeeId = null; // Ensure it resets to null
    this.selectedDate = null;     // Ensure it resets to null
    this.selectedShiftTime = null; // Ensure it resets to null

    setTimeout(() => {
      // Use this if you want to also reset validation states
      this.assignShiftFormRef.resetForm();
    }, 0); // setTimeout is crucial for ngModel to update first
  }
}