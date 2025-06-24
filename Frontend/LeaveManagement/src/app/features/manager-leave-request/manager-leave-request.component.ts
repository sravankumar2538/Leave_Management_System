import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LeaveRequestStatusResponseDto } from '../LeaveRequest/dtos/LeaveRequestStatusResponseDto';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../shared/api-response.interface';
import { LeaveRequestService } from '../LeaveRequest/leave-request.service';
import { ToastrService } from 'ngx-toastr';

import { Subject } from 'rxjs';
import { takeUntil, take, debounceTime, distinctUntilChanged } from 'rxjs/operators'; // Add debounceTime, distinctUntilChanged
import { PopupComponent } from '../../shared/popup/popup.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule for search input

@Component({
  selector: 'app-manager-leave-request',
  standalone: true,
  imports: [CommonModule, PopupComponent, FormsModule], // Add FormsModule here
  templateUrl: './manager-leave-request.component.html',
  styleUrl: './manager-leave-request.component.css'
})
export class ManagerLeaveRequestComponent implements OnInit, OnDestroy {
  allLeaveRequests: LeaveRequestStatusResponseDto[] = []; // Stores all fetched requests
  filteredLeaveRequests: LeaveRequestStatusResponseDto[] = []; // Stores requests after search filter
  paginatedLeaveRequests: LeaveRequestStatusResponseDto[] = []; // Stores requests for current page

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed, 5-10 is a good starting point for tables
  totalPages: number = 1;
  pages: number[] = [];

  // Search property (optional, but good to add now for future extensibility)
  private readonly searchTermSubject = new Subject<string>();
  private _searchTerm: string = '';

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    this.searchTermSubject.next(value); // Emit new value for debounced filtering
  }

  private readonly destroy$ = new Subject<void>();

  @ViewChild('confirmPopup') confirmPopup!: PopupComponent;

  constructor(
    private readonly leaveRequestService: LeaveRequestService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getLeaveRequestStatus();

    // Setup debounced search subscription
    this.searchTermSubject.pipe(
      debounceTime(300), // Wait for 300ms pause in typing
      distinctUntilChanged(), // Only emit if the search term has changed
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilterAndPaginate();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTermSubject.complete(); // Complete search subject too
  }

  getLeaveRequestStatus(): void {
    this.isLoading = true;
    this.hasError = false; // Reset error state
    this.errorMessage = ''; // Clear error message
    this.allLeaveRequests = []; // Clear current data before fetching new data
    this.filteredLeaveRequests = [];
    this.paginatedLeaveRequests = [];
    this.updatePaginationDetails(0); // Reset pagination display

    this.leaveRequestService.GetPendingRequestsByManager()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any[]>) => {
          this.isLoading = false;

          if (response.isSuccess) {
            if (response.data && response.data.length > 0) {
              this.allLeaveRequests = response.data.map(item => ({
                ...item,
                startDate: new Date(item.startDate),
                endDate: new Date(item.endDate),
                timeStamp: new Date(item.timeStamp)
              }));
              this.hasError = false; // Ensure no error if data is present
              this.errorMessage = ''; // Clear error message
              this.applyFilterAndPaginate(); // Apply filter and pagination after initial load
            } else {
              // Case: API successful but no data
              this.allLeaveRequests = [];
              this.hasError = true; // Set error state to display "No leave requests found"
              this.errorMessage = 'No leave requests found.';
              this.applyFilterAndPaginate(); // Still call to reset pagination
            }
          } else {
            // Case: API returned isSuccess: false
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve leave requests due to a backend issue.';
            this.allLeaveRequests = []; // Clear data on backend error
            this.applyFilterAndPaginate(); // Still call to reset pagination
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.allLeaveRequests = []; // Always clear data on HTTP error
          this.applyFilterAndPaginate(); // Still call to reset pagination

          let userErrorMessage = 'An unexpected error occurred. Please try again.';

          if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            userErrorMessage = (error.error).message;
          } else if (error.status === 0) {
            userErrorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
          } else if (typeof error.error === 'string' && error.error.trim() !== '') {
            userErrorMessage = error.error; // Fallback for plain string error messages
          } else {
            userErrorMessage = `Server Error (${error.status}): ${error.statusText || 'Unknown error occurred.'}`;
          }

          this.errorMessage = userErrorMessage;
        }
      });
  }

  /**
   * Applies the search filter to allLeaveRequests and then updates pagination.
   * This method is called after initial data load or when the search term changes.
   */
  applyFilterAndPaginate(): void {
    if (!this.allLeaveRequests) {
      this.filteredLeaveRequests = [];
    } else if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredLeaveRequests = [...this.allLeaveRequests]; // No search term, show all
    } else {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      this.filteredLeaveRequests = this.allLeaveRequests.filter(request =>
        (request.employeeId != null && request.employeeId.toString().toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.firstName && request.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.lastName && request.lastName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.leaveType && request.leaveType.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.status && request.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.startDate && request.startDate.toLocaleDateString().toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.endDate && request.endDate.toLocaleDateString().toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.totalDays != null && request.totalDays.toString().toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    this.currentPage = 1; // Reset to first page after applying new filter
    this.updatePaginationDetails(this.filteredLeaveRequests.length);
  }

  /**
   * Updates the pagination properties (totalPages, pages array) and slices
   * the filtered data to get the paginated data for the current view.
   * @param totalItems The total number of items after filtering.
   */
  private updatePaginationDetails(totalItems: number): void {
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    // Ensure currentPage doesn't exceed totalPages if items are removed by filter
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1; // If no items, show page 1
    }

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // Generate page numbers array

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLeaveRequests = this.filteredLeaveRequests.slice(startIndex, endIndex);
  }

  /**
   * Navigates to a specific page number.
   * @param page The page number to navigate to.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginationDetails(this.filteredLeaveRequests.length);
    }
  }

  /**
   * Navigates to the previous page.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginationDetails(this.filteredLeaveRequests.length);
    }
  }

  /**
   * Navigates to the next page.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginationDetails(this.filteredLeaveRequests.length);
    }
  }

  triggerApproveConfirmation(leaveRequest: LeaveRequestStatusResponseDto): void {
    const message = `Are you sure you want to APPROVE the ${leaveRequest.leaveType} leave request for ${leaveRequest.firstName} ${leaveRequest.lastName} from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}?`;
    this.confirmPopup.show(message);

    this.confirmPopup.confirmed.pipe(take(1), takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performApproveLeaveRequest(leaveRequest.leaveId);
      } else {
        this.toastr.info('Leave request approval cancelled.', 'Info');
      }
    });
  }

  private performApproveLeaveRequest(leaveId: string): void {
    this.leaveRequestService.ApproveLeaveRequest(leaveId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastr.success(response.message, 'Success');
            this.getLeaveRequestStatus(); // Reload data after successful operation
          } else {
            this.toastr.error(response.message || 'Failed to approve leave request.', 'Error');
          }
        },
        error: (err: HttpErrorResponse) => {
          let errorMsg = 'An unexpected error occurred during approval.';
          if (err.error && typeof err.error === 'object' && 'message' in err.error) {
            errorMsg = (err.error).message;
          } else if (err.status === 0) {
            errorMsg = 'Network error: Could not connect to the server.';
          } else if (typeof err.error === 'string' && err.error.trim() !== '') {
            errorMsg = err.error;
          } else {
            errorMsg = `Server Error (${err.status}): ${err.statusText || 'Unknown error occurred.'}`;
          }
          this.toastr.error(errorMsg, 'Error');
        }
      });
  }

  triggerRejectConfirmation(leaveRequest: LeaveRequestStatusResponseDto): void {
    const message = `Are you sure you want to REJECT the ${leaveRequest.leaveType} leave request for ${leaveRequest.firstName} ${leaveRequest.lastName} from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}?`;
    this.confirmPopup.show(message);

    this.confirmPopup.confirmed.pipe(take(1), takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performRejectLeaveRequest(leaveRequest.leaveId);
      } else {
        this.toastr.info('Leave request rejection cancelled.', 'Info');
      }
    });
  }

  private performRejectLeaveRequest(leaveId: string): void {
    this.leaveRequestService.RejectLeaveRequest(leaveId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastr.success(response.message, "Success");
            this.getLeaveRequestStatus(); // Reload data after successful operation
          } else {
            this.toastr.error(response.message || 'Failed to reject leave request.', "Error");
          }
        },
        error: (err: HttpErrorResponse) => {
          let errorMsg = 'An unexpected error occurred during rejection.';
          if (err.error && typeof err.error === 'object' && 'message' in err.error) {
            errorMsg = (err.error).message;
          } else if (err.status === 0) {
            errorMsg = 'Network error: Could not connect to the server.';
          } else if (typeof err.error === 'string' && err.error.trim() !== '') {
            errorMsg = err.error;
          } else {
            errorMsg = `Server Error (${err.status}): ${err.statusText || 'Unknown error occurred.'}`;
          }
          this.toastr.error(errorMsg, 'Error');
        }
      });
  }
}