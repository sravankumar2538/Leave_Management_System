import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LeaveRequestStatusResponseDto } from '../LeaveRequest/dtos/LeaveRequestStatusResponseDto';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaveRequestService } from '../LeaveRequest/leave-request.service';
import { ApiResponse } from '../../shared/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { UpdateLeaveRequestDto } from '../LeaveRequest/dtos/UpdateLeaveRequestDto';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as popupComponent from '../../shared/popup/popup.component'; // Import the PopupComponent

// Interface for the update form model
interface UpdateLeaveFormModel {
  leaveId: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-employee-leave-request-status',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, popupComponent.PopupComponent],
  templateUrl: './employee-leave-request-status.component.html',
  styleUrl: './employee-leave-request-status.component.css'
})
export class EmployeeLeaveRequestStatusComponent implements OnInit, OnDestroy {
  leaveRequests: LeaveRequestStatusResponseDto[] = []; // Holds all fetched leave requests from API
  filteredLeaveRequests: LeaveRequestStatusResponseDto[] = []; // Holds leave requests after search filter
  paginatedLeaveRequests: LeaveRequestStatusResponseDto[] = []; // Holds leave requests for the current page

  isLoading: boolean = false;
  hasError: boolean = false; // Indicates if there was an API error
  errorMessage: string = ''; // Message for API errors

  showUpdateModal: boolean = false;
  isUpdating: boolean = false;
  currentUpdatingLeaveId: string | null = null;

  updateFormModel: UpdateLeaveFormModel = {
    leaveId: null,
    leaveType: "",
    startDate: "",
    endDate: ""
  };

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // You can adjust this value
  totalItems: number = 0; // Total items after filtering (i.e., filteredLeaveRequests.length)
  totalPages: number = 0;

  // Search property
  searchTerm: string = '';

  private readonly destroy$ = new Subject<void>();

  @ViewChild('cancelConfirmPopup') cancelConfirmPopup!: popupComponent.PopupComponent;
  @ViewChild('updateConfirmPopup') updateConfirmPopup!: popupComponent.PopupComponent;

  constructor(
    private readonly leaveRequestService: LeaveRequestService,
    private readonly toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadLeaveRequestsStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLeaveRequestsStatus(): void {
    this.isLoading = true;
    this.hasError = false; // Reset error state before new fetch
    this.errorMessage = ''; // Clear previous error messages

    this.leaveRequestService.GetEmployeeStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<LeaveRequestStatusResponseDto[]>) => {
          if (response.isSuccess) {
            this.leaveRequests = response.data && response.data.length > 0 ?
              response.data.map(item => ({
                ...item,
                startDate: new Date(item.startDate),
                endDate: new Date(item.endDate),
                timeStamp: new Date(item.timeStamp)
              })) : [];
            this.hasError = false; // Explicitly set to false on success
            this.errorMessage = ''; // Ensure no lingering error message
          } else {
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve leave status.';
            this.leaveRequests = []; // Clear data on logical API error
          }
          this.applyFilterAndPagination(); // Apply filtering and pagination with new data
        },
        error: (error: HttpErrorResponse) => {
          this.hasError = true;
          this.leaveRequests = []; // Clear data on HTTP error
          this.applyFilterAndPagination(); // Reset displayed data
          if (error.error instanceof ErrorEvent) {
            this.errorMessage = `Network error: ${error.error.message}. Please check your internet connection.`;
          } else if (error.status === 0) {
            this.errorMessage = 'Could not connect to the server. Please ensure the backend service is running or check your network.';
          } else {
            try {
              const errorBody = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              if (errorBody && errorBody.message) {
                this.errorMessage = errorBody.message;
              } else if (errorBody && errorBody.errors) {
                const validationErrors: string[] = [];
                for (const key in errorBody.errors) {
                  if (errorBody.errors.hasOwnProperty(key)) {
                    validationErrors.push(...errorBody.errors[key]);
                  }
                }
                this.errorMessage = validationErrors.length > 0
                  ? `Validation failed: ${validationErrors.join('; ')}`
                  : `Server error (${error.status}): Invalid request data.`;
              } else if (typeof error.error === 'string' && error.error.trim() !== '') {
                this.errorMessage = error.error;
              } else {
                this.errorMessage = `Server Error (${error.status}): ${error.statusText || 'An unexpected problem occurred on the server.'}`;
              }
            } catch (e) {
              this.errorMessage = `Server Error (${error.status}): ${error.statusText || 'Could not process server response format.'}`;
            }
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  /**
   * Applies the search filter to leaveRequests and then updates pagination.
   */
  applyFilterAndPagination(): void {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();

    // 1. Apply filter
    if (lowerCaseSearchTerm) {
      this.filteredLeaveRequests = this.leaveRequests.filter(request => {
        // Convert dates to a comparable string format (e.g., 'dd-MM-yyyy') for search
        // Using toLocaleDateString without options might result in different formats across browsers.
        // Explicit options ensure consistent 'dd/mm/yyyy' or similar if needed.
        const formattedStartDate = request.startDate.toLocaleDateString('en-GB'); // Example: 18/06/2025
        const formattedEndDate = request.endDate.toLocaleDateString('en-GB');
        const formattedTimeStamp = request.timeStamp.toLocaleDateString('en-GB') + ' ' + request.timeStamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        return (
          request.leaveType.toLowerCase().includes(lowerCaseSearchTerm) ||
          request.status.toLowerCase().includes(lowerCaseSearchTerm) ||
          formattedStartDate.includes(lowerCaseSearchTerm) ||
          formattedEndDate.includes(lowerCaseSearchTerm) ||
          formattedTimeStamp.includes(lowerCaseSearchTerm) ||
          request.totalDays.toString().includes(lowerCaseSearchTerm)
        );
      });
    } else {
      this.filteredLeaveRequests = [...this.leaveRequests]; // If no search term, show all data
    }

    // 2. Calculate pagination based on filtered data
    this.totalItems = this.filteredLeaveRequests.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // Ensure current page is valid after filtering/data change
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLeaveRequests = this.filteredLeaveRequests.slice(startIndex, endIndex);

    // Note: Error messages and "no data" messages are now purely handled by HTML *ngIfs.
    // The hasError and errorMessage properties are reserved for API errors.
  }

  /**
   * Called when the search input changes. Resets current page and applies filter.
   */
  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page on new search
    this.applyFilterAndPagination();
  }

  // Pagination methods

  /**
   * Returns an array of page numbers to be displayed in the pagination control.
   * This logic can be customized (e.g., to show only a few pages around the current page).
   */
  get pages(): number[] {
    const pageList: number[] = [];
    // You can implement more sophisticated page list generation here
    // For now, let's generate all pages up to totalPages
    for (let i = 1; i <= this.totalPages; i++) {
      pageList.push(i);
    }
    return pageList;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.applyFilterAndPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilterAndPagination(); // Re-apply filter and pagination
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilterAndPagination(); // Re-apply filter and pagination
    }
  }

  triggerCancelConfirmation(leaveRequest: LeaveRequestStatusResponseDto): void {
    const message = `Are you sure you want to cancel the ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}?`;
    this.cancelConfirmPopup.show(message);

    this.cancelConfirmPopup.confirmed.pipe(takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performCancelRequest(leaveRequest.leaveId);
      } else {
        this.toastrService.info('Cancellation action aborted.', 'Info');
      }
    });
  }

  private performCancelRequest(leaveId: string): void {
    this.leaveRequestService.deleteLeaveRequest(leaveId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message, "Success");
            this.loadLeaveRequestsStatus(); // Reload data to re-apply filtering and pagination
          } else {
            this.toastrService.error(response.message || 'Failed to cancel leave request.', "Error");
          }
        },
        error: (err: HttpErrorResponse) => {
          const errorMsg = (err.error?.message ?? err.message) ?? 'An error occurred during cancellation.';
          this.toastrService.error(errorMsg, 'Error');
        }
      });
  }

  updateRequest(leaveRequest: LeaveRequestStatusResponseDto): void {
    this.currentUpdatingLeaveId = leaveRequest.leaveId;
    this.updateFormModel = {
      leaveId: leaveRequest.leaveId,
      leaveType: leaveRequest.leaveType,
      startDate: leaveRequest.startDate.toISOString().split('T')[0],
      endDate: leaveRequest.endDate.toISOString().split('T')[0]
    };
    this.showUpdateModal = true;
  }

  triggerSubmitUpdateConfirmation(): void {
    if (!this.updateFormModel.leaveId) {
      this.toastrService.error('Cannot update request: ID is missing.', 'Error');
      return;
    }

    if (!this.updateFormModel.leaveType || !this.updateFormModel.startDate || !this.updateFormModel.endDate) {
      this.toastrService.warning('Please fill in all fields for the update request.', 'Validation Warning');
      return;
    }

    const formStartDate = new Date(this.updateFormModel.startDate);
    const formEndDate = new Date(this.updateFormModel.endDate);

    if (formStartDate > formEndDate) {
      this.toastrService.error('Start date cannot be after end date for update.', 'Invalid Date Range');
      return;
    }

    const message = `Confirm to submit the updated leave request for ${this.updateFormModel.leaveType} from ${new Date(this.updateFormModel.startDate).toLocaleDateString()} to ${new Date(this.updateFormModel.endDate).toLocaleDateString()}?`;
    this.updateConfirmPopup.show(message);

    this.updateConfirmPopup.confirmed.pipe(takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performSubmitUpdate();
      } else {
        this.toastrService.info('Leave request changes discarded', 'Info');
      }
    });
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.currentUpdatingLeaveId = null;
    this.updateFormModel = {
      leaveId: null,
      leaveType: "",
      startDate: "",
      endDate: ""
    };
  }

  private performSubmitUpdate(): void {
    this.isUpdating = true;

    const updateDto: UpdateLeaveRequestDto = {
      leaveId: this.updateFormModel.leaveId!,
      leaveType: this.updateFormModel.leaveType,
      startDate: this.updateFormModel.startDate,
      endDate: this.updateFormModel.endDate
    };


    this.leaveRequestService.updateLeaveRequest(updateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          this.isUpdating = false;
          if (response.isSuccess) {
            this.toastrService.success(response.message, 'Update Success');
            this.closeUpdateModal();
            this.loadLeaveRequestsStatus(); // Reload data to show updated status
          } else {
            this.toastrService.error(response.message || 'Failed to update leave request.', 'Update Error');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isUpdating = false;
          let errorMessage = 'An error occurred during update.';

          if (error.status === 0) {
            errorMessage = 'Could not connect to the server for update. Please check your internet connection.';
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status) {
            errorMessage = `Server Error (${error.status}): ${error.statusText || 'Please try again.'}`;
          }
          this.toastrService.error(errorMessage, 'Update Failed');
        }
      });
  }

  resetForm(): void {
    this.searchTerm = ''; // Clear search term
    this.currentPage = 1; // Reset to first page
    this.loadLeaveRequestsStatus(); // Re-fetch all data and re-apply initial filter/pagination
    this.closeUpdateModal(); // Close modal if open
  }
}