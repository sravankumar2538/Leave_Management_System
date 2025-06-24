import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { ApiResponse } from '../../shared/api-response.interface'; // Ensure this interface has a 'message' property
import { LeaveBalanceResponseDto } from '../LeaveBalance/Dtos/LeaveBalanceResponse.dto';
import { LeaveBalanceService } from '../LeaveBalance/leave-balance.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Important for directives like *ngIf, *ngFor

// Import RxJS Subject for managing subscriptions
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-leave-balance',
  standalone: true, // Assuming this is a standalone component
  imports: [
    CommonModule // Needed for Angular directives in the template (e.g., *ngIf, *ngFor)
  ],
  templateUrl: './leave-balance.component.html',
  styleUrl: './leave-balance.component.css'
})
export class LeaveBalanceComponent implements OnInit, OnDestroy { // Implement OnDestroy

  // Initialize with default values, this will hold the SINGLE DTO we extract from the array
  leaveBalanceData: LeaveBalanceResponseDto = {
    employeeId: 0,
    firstName: "",
    lastName: "",
    year: new Date().getFullYear().toString(),
    casual: 0,
    sick: 0,
    vacation: 0,
    medical: 0,
  };

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Declare a private Subject that will emit a value when the component is destroyed
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly leaveBalanceService: LeaveBalanceService
  ) {}

  ngOnInit(): void {
    // Call the method to fetch data when the component initializes
    this.getEmployeeLeaveBalance();
  }

  /**
   * ngOnDestroy lifecycle hook.
   * Ensures that all subscriptions are unsubscribed when the component is destroyed
   * to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal completion
    this.destroy$.complete(); // Complete the Subject
  }

  /**
   * Fetches the employee's leave balance data from the service.
   * Handles loading states, success, and error responses.
   */
  getEmployeeLeaveBalance(): void {
    this.isLoading = true; // Start loading
    this.hasError = false; // Reset error state
    this.errorMessage = ''; // Clear previous error message

    // Subscribe to the Observable returned by the service
    // Corrected the type of 'response' to expect an array: ApiResponse<LeaveBalanceResponseDto[]>
    this.leaveBalanceService.getAllHolidays()
      .pipe(takeUntil(this.destroy$)) // Add takeUntil operator here for automatic unsubscription
      .subscribe({
        next: (response: ApiResponse<LeaveBalanceResponseDto[]>) => { // FIX 1: Expected type is now array
          this.isLoading = false; // Loading finished

          if (response.isSuccess) {
            // Assuming you want the first item from the array if successful.
            // Adjust this logic if your API returns multiple and you need a specific one.
            if (response.data && response.data.length > 0) {
              this.leaveBalanceData = response.data[0]; // FIX 2: Assign the first element of the array
            } else {
              // Handle case where success is true but data array is empty
              this.hasError = true;
              this.errorMessage = 'No leave balance data found.';
            }
          } else {
            // Handle cases where isSuccess is false (backend returned an error message)
            this.hasError = true;
            // FIX 3: Use response.message for backend error message, with a fallback
            this.errorMessage = response.message || 'Failed to retrieve leave balances.';
          }
        },
        error: (error: HttpErrorResponse) => { // Type the error explicitly
          this.isLoading = false; // Loading finished
          this.hasError = true; // Set error state


          // Determine the error message to display in the UI (if you're showing it)
          if (error.error && typeof error.error === 'object' && error.error.message) {
            // Use the specific error message from the backend if available
            this.errorMessage = error.error.message;
          } else if (error.status === 0) {
            // Network error (server unreachable, CORS issues)
            this.errorMessage = 'Network error: Could not connect to the server.';
          } else if (error.status >= 400 && error.status < 500) {
            // Client-side errors (e.g., 404 Not Found, 401 Unauthorized)
            this.errorMessage = `Client error (${error.status}): Invalid request or data.`;
          } else if (error.status >= 500) {
            // Server-side errors
            this.errorMessage = `Server error (${error.status}): Please try again later.`;
          } else {
            // Generic fallback for any other unexpected errors
            this.errorMessage = 'An unexpected error occurred while fetching leave balances.';
          }
        }
      });
  }
}