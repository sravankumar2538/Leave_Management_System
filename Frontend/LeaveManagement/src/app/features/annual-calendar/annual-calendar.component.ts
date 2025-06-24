import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { ApiResponse } from '../../shared/api-response.interface'; // Ensure this interface has a 'message' property
import { HolidayCalendarResponseDto } from '../HolidayCalendar/Dtos/HolidayResponse.dto';
import { HolidayCalendarService } from '../HolidayCalendar/holiday-calendar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Important for directives like *ngIf, *ngFor

// Import RxJS Subject for managing subscriptions
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'; // Import takeUntil operator


@Component({
  selector: 'app-annual-calendar',
  standalone: true, // Assuming this is a standalone component
  imports: [CommonModule],
  templateUrl: './annual-calendar.component.html',
  styleUrl: './annual-calendar.component.css'
})
export class AnnualCalendarComponent implements OnInit, OnDestroy { // Implement OnDestroy

  // FIX 1: Initialize as an array, as getAnnualHolidays likely returns multiple holidays
  holidayCalendarData: HolidayCalendarResponseDto[] = [];

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Declare a private Subject that will emit a value when the component is destroyed
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly holidayCalendarService: HolidayCalendarService) {}

  ngOnInit(): void {
    this.getHolidayCalendar();
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
   * Fetches the annual holiday calendar data from the service.
   * Handles loading states, success, and error responses.
   */
  getHolidayCalendar(): void {
    this.isLoading = true; // Start loading
    this.hasError = false; // Reset error state
    this.errorMessage = ''; // Clear previous error message

    // FIX 2: Move the entire subscribe block inside the method
    this.holidayCalendarService.getAnnualHolidays()
      .pipe(takeUntil(this.destroy$)) // Add takeUntil operator here for automatic unsubscription
      .subscribe({
        next: (response: ApiResponse<HolidayCalendarResponseDto[]>) => { // Correctly expecting an array
          this.isLoading = false; // Loading finished

          if (response.isSuccess) {
            if (response.data && response.data.length > 0) {
              this.holidayCalendarData = response.data; // FIX 3: Assign the entire array
            } else {
              // Handle case where success is true but data array is empty
              this.hasError = false; // Not a server error, just no data
              this.errorMessage = 'No holiday data found for the current year.';
              this.holidayCalendarData = []; // Ensure data is cleared
            }
          } else {
            // Handle cases where isSuccess is false (backend returned an error message)
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve Annual Calendar.'; // Using response.message
            this.holidayCalendarData = []; // Ensure data is cleared
          }
        },
        error: (error: HttpErrorResponse) => { // Type the error explicitly
          this.isLoading = false; // Loading finished
          this.hasError = true; // Set error state


          // Determine the error message to display in the UI (if you're showing it)
          if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            // Use the specific error message from the backend if available
            this.errorMessage = (error.error).message; // Use 'as any' for simpler access if type is complex
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
            this.errorMessage = 'An unexpected error occurred while fetching holiday calendar.';
          }
          this.holidayCalendarData = []; // Ensure data is cleared on error
        },
        
      });
  }
}