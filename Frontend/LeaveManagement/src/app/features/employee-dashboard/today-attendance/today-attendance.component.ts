import { Component, OnInit, OnDestroy } from '@angular/core';
import { AttendanceService } from '../../Attendance/attendance.service';
import { EmployeeAttendanceResponseDto } from '../../Attendance/Dtos/EmployeeAttendanceResponseDto';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../shared/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Corrected import path and variable name for the constants
import { DASHBOARD_CONSTANTS } from '../dashboard-constants'; // Assuming the file is dashboard-constants.ts

/**
 * @interface DailyAttendanceProgress
 * @description Defines the structure for displaying daily attendance progress in the UI.
 * The percentage and totalHours are sourced directly from the API response (DTO),
 * while colorClass is determined client-side based on the percentage.
 */
interface DailyAttendanceProgress {
  date: Date;        // The date of the attendance record.
  percentage: number; // The attendance percentage for the day, provided by the API.
  colorClass: string; // CSS class (e.g., 'progress-bar-green') derived from the percentage for visual feedback.
  totalHours: number; // Total work hours for the day, provided by the API.
}

/**
 * @component TodayAttendanceComponent
 * @description This component displays the weekly attendance progress for an employee.
 * It fetches attendance data from an API, processes it, and renders
 * progress bars for each day of the week.
 *
 * @selector app-today-attendance
 * @standalone true
 * @imports CommonModule - Required for Angular directives like *ngIf and *ngFor, and pipes like 'date'.
 * @templateUrl './today-attendance.component.html' - The HTML template for this component.
 * @styleUrl './today-attendance.component.css' - The component-specific CSS styles.
 */
@Component({
  selector: 'app-today-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-attendance.component.html',
  styleUrl: './today-attendance.component.css'
})
export class TodayAttendanceComponent implements OnInit, OnDestroy {
  // Stores the raw attendance data received directly from the API.
  attendanceResponse: EmployeeAttendanceResponseDto[] = [];
  // Stores the processed data formatted for UI display, including calculated color classes.
  weeklyProgressData: DailyAttendanceProgress[] = [];

  // UI state flags for controlling message display (loading, error).
  isLoading: boolean = false; // Indicates if data is currently being fetched.
  hasError: boolean = false;  // Indicates if an error occurred during data fetching.
  errorMessage: string = '';  // Stores the error message to be displayed to the user.

  // RxJS Subject to handle component destruction and unsubscribe from ongoing observables,
  // preventing memory leaks.
  private readonly destroy$ = new Subject<void>();

  /**
   * @constructor
   * @param attendanceService Injects the AttendanceService for making API calls related to attendance.
   */
  constructor(private readonly attendanceService: AttendanceService) { }

  /**
   * @lifecycle OnInit
   * @description Lifecycle hook called after Angular initializes the component's view.
   * It's used here to initiate the fetching of employee attendance data.
   */
  ngOnInit(): void {
    this.GetEmployeeWeekAttendance();
  }

  /**
   * @lifecycle OnDestroy
   * @description Lifecycle hook called when the component is about to be destroyed.
   * It's crucial for unsubscribing from RxJS observables to prevent memory leaks.
   * `destroy$.next()` emits a value to signal completion, and `destroy$.complete()`
   * closes the Subject.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @method GetEmployeeWeekAttendance
   * @description Fetches the weekly attendance records for the employee from the backend API.
   * Manages loading states, error handling, and data processing.
   */
  GetEmployeeWeekAttendance(): void {
    // Set loading state to true and reset any previous error states before making the API call.
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.weeklyProgressData = []; // Clear previous data to show fresh loading state

    // Call the attendance service to get data.
    // `pipe(takeUntil(this.destroy$))` ensures the subscription is automatically unsubscribed
    // when the component is destroyed.
    this.attendanceService.getEmployeeWeekAttendanceRecords()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        /**
         * @callback next
         * @description Handles successful API responses.
         * @param response The API response, expected to be an ApiResponse containing an array of EmployeeAttendanceResponseDto.
         */
        next: (response: ApiResponse<EmployeeAttendanceResponseDto[]>) => {
          this.isLoading = false; // Always turn off loading state when a response is received.

          if (response.isSuccess) {
            // Check if data is present, is an array, and has elements.
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              this.attendanceResponse = response.data; // Store raw API data.
              this.processAttendanceData();            // Process the data for UI display.
            } else {
              // If API call is successful but no data is returned, treat as a "no data" scenario.
              this.attendanceResponse = [];
              this.hasError = true; // Set hasError to true to display a message.
              this.errorMessage = 'No attendance records found for the week.';
            }
          } else {
            // Handle cases where the API indicates a failure (isSuccess is false).
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve attendance records due to a backend issue.';
            this.attendanceResponse = [];
          }
        },
        /**
         * @callback error
         * @description Handles errors during the API call (e.g., network issues, HTTP errors).
         * @param error The HttpErrorResponse object.
         */
        error: (error: HttpErrorResponse) => {
          this.isLoading = false; // Always turn off loading state on error.
          this.hasError = true;   // Indicate that an error occurred.
          this.attendanceResponse = []; // Clear data on error.
          this.weeklyProgressData = []; // Clear processed data on error.

          let userErrorMessage = 'An unexpected error occurred. Please try again.';

          // Attempt to extract a user-friendly error message from the HttpErrorResponse.
          if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            userErrorMessage = (error.error as any).message; // Cast to 'any' to safely access 'message'
          } else if (error.status === 0) {
            userErrorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
          } else if (error.status) {
            userErrorMessage = `Server Error (${error.status}): ${error.statusText || 'Unknown error occurred.'}`;
          }

          this.errorMessage = userErrorMessage;
        },
        /**
         * @callback complete
         * @description Handles the completion of the observable stream (whether success or error).
         * Ensures `isLoading` is false after the operation finishes.
         */
        complete: () => {
          this.isLoading = false; // Ensure loading is false on completion of the stream.
        }
      });
  }

  /**
   * @private
   * @method processAttendanceData
   * @description Transforms the raw `attendanceResponse` (from the API) into `weeklyProgressData`
   * which is optimized for display in the template. This method determines the
   * `colorClass` for the progress bars based on the `percentage` received from the API.
   */
  private processAttendanceData(): void {
    // Map each API record to the DailyAttendanceProgress interface.
    this.weeklyProgressData = this.attendanceResponse.map(record => {
      let colorClass: string;
      // Determine the color class based on the percentage provided by the API.
      // --- MODIFICATION START ---
      // Use the correctly imported DASHBOARD_CONSTANTS
      if (record.percentage >= DASHBOARD_CONSTANTS.HIGH_PERCENTAGE) {
        colorClass = 'progress-bar-green';
      } else if (record.percentage >= DASHBOARD_CONSTANTS.MEDIUM_PERCENTAGE) {
        colorClass = 'progress-bar-orange';
      } else {
        colorClass = 'progress-bar-red';
      }
      // --- MODIFICATION END ---

      return {
        date: new Date(record.date),                          // Convert date string to Date object.
        percentage: Math.round(record.percentage),            // Use API percentage, rounded for display.
        colorClass: colorClass,                               // Assign the determined color class.
        totalHours: parseFloat(record.workHours.toFixed(2)) // Use API work hours, formatted to 2 decimal places.
      };
    });

    // Sort the processed data by date to ensure progress bars are displayed chronologically.
    this.weeklyProgressData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
