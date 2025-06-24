import { Component, ViewChild, OnDestroy } from '@angular/core'; // Import ViewChild, OnDestroy
import { FormsModule, NgForm } from '@angular/forms'; // Required for [(ngModel)], NgForm
import { PostLeaveRequestDto } from '../LeaveRequest/dtos/PostLeaveRequestDto';
import { LeaveRequestService } from '../LeaveRequest/leave-request.service';
import { ApiResponse } from '../../shared/api-response.interface';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { PopupComponent } from '../../shared/popup/popup.component'; // Import PopupComponent
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators'; // Import filter

// Interface to represent the form data as strings (from HTML inputs)
interface LeaveFormModel {
  leaveType: string;
  startDate: string; // HTML <input type="date"> binds to string in формате YYYY-MM-DD
  endDate: string;   // HTML <input type="date"> binds to string in формате YYYY-MM-DD
}

@Component({
  selector: 'app-employee-leave-request',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PopupComponent // Include PopupComponent here
  ],
  templateUrl: './employee-leave-request.component.html',
  styleUrl: './employee-leave-request.component.css'
})
export class EmployeeLeaveRequestComponent implements OnDestroy { // Implement OnDestroy
  leaveFormModel: LeaveFormModel = {
    leaveType: "",
    startDate: "",
    endDate: ""
  };

  isLoading: boolean = false;
  isConfirmationPending: boolean = false; // New flag to track if confirmation popup is active

  private readonly destroy$ = new Subject<void>();

  @ViewChild('leaveFormRef') leaveFormRef!: NgForm; // Reference to the form
  @ViewChild('submitConfirmPopup') submitConfirmPopup!: PopupComponent; // ViewChild for the new popup

  constructor(
    private readonly leaveRequestService: LeaveRequestService,
    private readonly toastrService: ToastrService,
    private readonly router: Router
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Triggers the confirmation popup before submitting the leave request.
   * This method is called when the form's (ngSubmit) event fires.
   */
  public triggerSubmitLeaveRequestConfirmation(): void {
    // Prevent re-triggering if a submission is already in progress or confirmation is pending
    if (this.isLoading || this.isConfirmationPending) {
      this.toastrService.info('A request is already being processed or awaiting confirmation.', 'Please Wait');
      return;
    }

    // Manually trigger validation checks for the form fields
    this.leaveFormRef.control.markAllAsTouched();
    if (this.leaveFormRef.invalid) {
      this.toastrService.warning('Please correct the errors in the form before submitting.', 'Validation Error');
      return;
    }

    // Basic client-side validation for empty fields (redundant with required, but good for clarity)
    if (!this.leaveFormModel.leaveType || !this.leaveFormModel.startDate || !this.leaveFormModel.endDate) {
      this.toastrService.warning('Please fill in all required fields.', 'Validation Warning');
      return;
    }

    // Additional client-side date validation: Ensure startDate is not after endDate
    if (this.leaveFormModel.startDate > this.leaveFormModel.endDate) {
      this.toastrService.error('Start date cannot be after end date.', 'Invalid Date Range');
      return;
    }

    const message = `Are you sure you want to submit a ${this.leaveFormModel.leaveType} leave request from ${new Date(this.leaveFormModel.startDate).toLocaleDateString()} to ${new Date(this.leaveFormModel.endDate).toLocaleDateString()}?`;
    this.submitConfirmPopup.show(message);
    this.isConfirmationPending = true; // Set flag when popup is shown

    // Subscribe to the confirmation result, ensuring only one confirmation per trigger
    this.submitConfirmPopup.confirmed
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.isConfirmationPending) // Only process if confirmation was pending
      )
      .subscribe((isConfirmed: boolean) => {
        this.isConfirmationPending = false; // Reset flag after confirmation handled
        if (isConfirmed) {
          this.performSubmitLeaveRequest(); // Proceed with the actual API submission
        } else {
          this.toastrService.info('Leave request submission cancelled.', 'Info');
        }
      });
  }

  /**
   * Performs the actual API call to submit the leave request.
   * This method is now private and called only after confirmation.
   */
  private performSubmitLeaveRequest(): void {
    this.isLoading = true;

    const submissionDto: PostLeaveRequestDto = {
      leaveType: this.leaveFormModel.leaveType,
      startDate: this.leaveFormModel.startDate,
      endDate: this.leaveFormModel.endDate
    };

    this.leaveRequestService.postLeaveRequest(submissionDto)
      .pipe(takeUntil(this.destroy$)) // Ensure subscription is unsubscribed on component destroy
      .subscribe({
        next: (response: ApiResponse<string>) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.toastrService.success(response.message, 'Success');
            this.router.navigate(['/employee/leave-request-status']);
            this.resetForm(); // This line resets the form after successful submission
          } else {
            this.toastrService.error(response.message || 'An unexpected server response occurred.', 'Submission Failed');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;

          let errorMessage = 'An unexpected error occurred. Please try again.';
          if(error.error.status === 400) {
           errorMessage = 'Bad Request: Please check the data you submitted.';
           this.toastrService.error(errorMessage, 'Submission Failed');
          }
          else if (error.error instanceof ErrorEvent) {
            errorMessage = `Network error: ${error.error.message}. Please check your internet connection.`;
          } else if (error.status === 0) {
            errorMessage = 'Could not connect to the server. Please ensure the backend service is running or check your network.';
          } else {
            try {
              const errorBody = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              if (errorBody && errorBody.message) {
                errorMessage = errorBody.message;
              } else if (errorBody && errorBody.errors) {
                const validationErrors: string[] = [];
                for (const key in errorBody.errors) {
                  if (errorBody.errors.hasOwnProperty(key)) {
                    validationErrors.push(...errorBody.errors[key]);
                  }
                }
                errorMessage = validationErrors.length > 0
                  ? `Validation failed: ${validationErrors.join('; ')}`
                  : `Server Error (${error.status}): Invalid request data.`;
              } else if (typeof error.error === 'string' && error.error.trim() !== '') {
                errorMessage = error.error;
              } else {
                errorMessage = `Server Error (${error.status}): ${error.statusText || 'An unexpected problem occurred on the server.'}`;
              }
            } catch (e) {
              errorMessage = `Server Error (${error.status}): ${error.statusText || 'Could not process server response format.'}`;
            }
          }
          this.toastrService.error(errorMessage, 'Submission Failed');
        }
      });
  }

  private resetForm(): void {
    this.leaveFormModel = {
      leaveType: "",
      startDate: "",
      endDate: ""
    };
    // Optionally reset the form's validation state if using NgForm directly
    this.leaveFormRef.resetForm();
  }
}