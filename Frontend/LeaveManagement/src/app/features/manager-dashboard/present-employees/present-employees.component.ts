// src/app/features/present-employees/present-employees.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { EmployeeService } from '../../Employee/employee.service';
import { ApiResponse } from '../../../shared/api-response.interface';
import { CommonModule } from '@angular/common'; // Provides common directives like *ngIf, *ngFor and pipes.
import { EmployeeListResponseDTO } from '../../Employee/Dtos/EmployeeListResponse-payload.dto';
import { HttpErrorResponse } from '@angular/common/http'; // Used for handling HTTP error responses

// Assuming you have a ManagerNavbarComponent, ensure it's standalone or imported via a module

// Import RxJS Subject for managing subscriptions
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'; // Import takeUntil operator


/**
 * @Component decorator: Defines the metadata for the Angular component.
 */
@Component({
  selector: 'app-present-employees', // The custom HTML tag used to render this component.
  standalone: true, // Marks this component as standalone, meaning it can be used without NgModules.
  imports: [CommonModule], // Imports CommonModule and ManagerNavbarComponent.
  templateUrl: './present-employees.component.html', // Path to the component's HTML template file.
  styleUrl: './present-employees.component.css' // Path to the component's CSS styles file.
})
export class PresentEmployeesComponent implements OnInit, OnDestroy { // Implement OnDestroy

  /**
   * @property employeeResponseData: Stores the array of employees present today.
   * This is correctly typed as an array `EmployeeListResponseDTO[]`.
   * Initialized as an empty array to match its type.
   */
  employeeResponseData : EmployeeListResponseDTO[] = []; // FIX: Initialized as an empty array

  /**
   * @property isLoading: Boolean flag to indicate if an API call is in progress.
   * Used to show/hide loading indicators in the template.
   */
  isLoading: boolean = false;

  /**
   * @property hasError: Boolean flag to indicate if an error occurred during an API call.
   * Used to show/hide error messages in the template.
   */
  hasError: boolean = false;

  /**
   * @property errorMessage: Stores the error message to be displayed to the user.
   */
  errorMessage: string = '';

  // Declare a private Subject that will emit a value when the component is destroyed
  private readonly destroy$ = new Subject<void>();

  /**
   * @constructor: Injects necessary services.
   * @param employeeService: An instance of EmployeeService to make API calls related to employees.
   */
  constructor(private readonly employeeService:EmployeeService){}

  /**
   * @method ngOnInit: Lifecycle hook that runs after Angular initializes the component.
   * It's a good place to fetch initial data.
   */
  ngOnInit(): void {
    // Calls the method to fetch the list of employees present today when the component initializes.
    this.GetTodayPresentEmployeesList();
  }

  /**
   * @method ngOnDestroy: Lifecycle hook called just before Angular destroys the component.
   * Used to unsubscribe from all active observables to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal completion
    this.destroy$.complete(); // Complete the Subject
  }

  /**
   * @method GetTodayPresentEmployeesList: Fetches the list of employees who are present today.
   * It interacts with the `employeeService` to make an HTTP request.
   */
  GetTodayPresentEmployeesList():void {
    this.isLoading = true; // Set loading to true before making the API call.
    this.hasError = false;   // Reset error state
    this.errorMessage = '';   // Clear any previous error messages

    // Subscribe to the Observable returned by GetCurrentDayEmployees method of employeeService.
    this.employeeService.GetCurrentDayEmployees()
      .pipe(takeUntil(this.destroy$)) // Add takeUntil operator here for automatic unsubscription
      .subscribe({
        /**
         * @callback next: Handles successful responses from the API.
         * @param response: The ApiResponse object containing `isSuccess` and `data`.
         */
        next : (response : ApiResponse<EmployeeListResponseDTO[]>) =>{
          this.isLoading = false; // Loading finished, hide loading indicator.

          if (response.isSuccess) {
            // Check if data itself exists and is an array.
            if (response.data && Array.isArray(response.data)) {
              // Assign the entire array of employee data to employeeResponseData.
              // FIX: Added type assertion to explicitly tell TypeScript that response.data is EmployeeListResponseDTO[].
              this.employeeResponseData = response.data;
              if (response.data.length === 0) {
                // Specific message if no employees are found but call was successful.
                this.errorMessage = 'No employees found present today.';
              }
              this.hasError = false; // Ensure error state is false on success.
            } else {
              // Handle case where success is true but data is missing or not an array.
              this.hasError = true;
              this.errorMessage = 'Received success response but no valid employee data.';
            }
          } else {
            // Handles cases where the backend explicitly indicates a non-successful operation.
            this.hasError = true;
            // Uses the backend's provided error message, or a generic fallback.
            this.errorMessage = response.message || 'Failed to retrieve today\'s employee list.';
          }
        },
        /**
         * @callback error: Handles HTTP error responses (e.g., network issues, server errors).
         * @param error: The HttpErrorResponse object containing details about the error.
         */
        error: (error: HttpErrorResponse) => {
          this.isLoading = false; // Loading finished, hide loading indicator.
          this.hasError = true;   // Set error state to true.


          // Determine the error message to display in the UI based on the HttpErrorResponse.
          if (error.error && typeof error.error === 'object' && error.error.message) {
            // Prioritize specific error message from the backend's error payload.
            this.errorMessage = error.error.message;
          } else if (error.status === 0) {
            // Network error (e.g., server unreachable, CORS issues, no internet connection).
            this.errorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
          } else if (error.status >= 400 && error.status < 500) {
            // Client-side errors (e.g., 404 Not Found, 401 Unauthorized, 403 Forbidden, 400 Bad Request).
            this.errorMessage = `Client error (${error.status}): Invalid request or data.`;
          } else if (error.status >= 500) {
            // Server-side errors (e.g., 500 Internal Server Error, 502 Bad Gateway).
            this.errorMessage = `Server error (${error.status}): Please try again later.`;
          } else {
            // Generic fallback for any other unexpected HTTP errors.
            this.errorMessage = 'An unexpected error occurred while fetching today\'s employee attendance.';
          }
        }
      });
  }
}