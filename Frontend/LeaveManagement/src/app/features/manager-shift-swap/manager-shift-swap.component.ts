import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ShiftSwapRequestResponseDto } from '../ShiftSwapRequest/Dtos/ShiftSwapRequestResponseDto';
import { ShiftSwapRequestService } from '../ShiftSwapRequest/shift-swap-request.service';
import { ApiResponse } from '../../shared/api-response.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { PopupComponent } from '../../shared/popup/popup.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-manager-shift-swap',
  standalone: true,
  imports: [CommonModule, DatePipe, PopupComponent, FormsModule], // Added FormsModule
  templateUrl: './manager-shift-swap.component.html',
  styleUrl: './manager-shift-swap.component.css'
})
export class ManagerShiftSwapComponent implements OnInit, OnDestroy {

  allShiftSwapRequests: ShiftSwapRequestResponseDto[] = []; // Stores all fetched requests
  filteredShiftSwapRequests: ShiftSwapRequestResponseDto[] = []; // Requests after applying search filter
  paginatedShiftSwapRequests: ShiftSwapRequestResponseDto[] = []; // Requests displayed on the current page

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  hasFetchedData: boolean = false; // Flag to indicate if data has been fetched at least once

  // Search property
  private readonly searchTermSubject = new Subject<string>();
  private _searchTerm: string = '';

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    this.searchTermSubject.next(value); // Emit new value for debounced filtering
  }

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed
  totalPages: number = 0;
  pagesToShow: number = 5; // Number of page buttons to display in pagination control

  private readonly destroy$ = new Subject<void>();

  @ViewChild('confirmPopup') confirmPopup!: PopupComponent;

  constructor(
    private readonly shiftSwapRequestService: ShiftSwapRequestService,
    private readonly toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.GetallEmployeePendingShiftSwapRequests();

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

  GetallEmployeePendingShiftSwapRequests(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.allShiftSwapRequests = []; // Clear current data before fetching new data
    this.filteredShiftSwapRequests = [];
    this.paginatedShiftSwapRequests = [];
    this.hasFetchedData = false; // Reset this flag before a new fetch
    this.searchTerm = ''; // Clear search term when fetching new data

    this.shiftSwapRequestService.AllShiftSwapRequestsByManager()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<ShiftSwapRequestResponseDto[]>) => {
          this.isLoading = false;
          this.hasFetchedData = true; // Mark that data fetch has completed

          if (response.isSuccess) {
            if (response.data && Array.isArray(response.data)) {
              this.allShiftSwapRequests = response.data.map(item => ({
                ...item,
                shiftDate: item.shiftDate ? new Date(item.shiftDate) : item.shiftDate,
                timeStamp: item.timeStamp ? new Date(item.timeStamp) : item.timeStamp
              })) as ShiftSwapRequestResponseDto[];

              this.applyFilterAndPaginate(); // Apply filter and pagination after initial load

              // If no data initially, set error message.
              if (this.allShiftSwapRequests.length === 0) {
                this.errorMessage = 'No shift swap requests found.';
              } else {
                this.hasError = false; // Clear hasError if data is found
                this.errorMessage = ''; // Clear error message
              }
            } else {
              this.hasError = true;
              this.errorMessage = 'Received success response but no valid shift swap data.';
              this.allShiftSwapRequests = []; // Ensure data is clear
              this.applyFilterAndPaginate(); // Update pagination/messages
            }
          } else {
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve shift swap requests due to a backend issue.';
            this.allShiftSwapRequests = []; // Ensure data is clear
            this.applyFilterAndPaginate(); // Update pagination/messages
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.hasFetchedData = true; // Mark that data fetch has completed
          this.allShiftSwapRequests = []; // Ensure data is clear on HTTP error
          this.applyFilterAndPaginate(); // Update pagination/messages

          let userErrorMessage: string;
          if (error.error && typeof error.error === 'object' && (error.error as any).message) {
            userErrorMessage = (error.error as any).message;
          } else if (error.status === 0) {
            userErrorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
          } else if (error.status >= 400 && error.status < 500) {
            userErrorMessage = `Client error (${error.status}): There was an issue with your request.`;
          } else if (error.status >= 500) {
            userErrorMessage = `Server error (${error.status}): Something went wrong on the server. Please try again later.`;
          } else {
            userErrorMessage = 'An unexpected error occurred while fetching shift swap requests.';
          }
          this.errorMessage = userErrorMessage;
         
        }
      });
  }

  /**
   * Applies the search filter to allShiftSwapRequests and then updates pagination.
   * This method is called after initial data load or when the search term changes.
   */
  applyFilterAndPaginate(): void {
    if (!this.allShiftSwapRequests) {
      this.filteredShiftSwapRequests = [];
    } else if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredShiftSwapRequests = [...this.allShiftSwapRequests]; // No search term, show all
    } else {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      this.filteredShiftSwapRequests = this.allShiftSwapRequests.filter(request =>
        (request.employeeId != null && request.employeeId.toString().toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.firstName && request.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.lastName && request.lastName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.shiftDate && request.shiftDate.toLocaleDateString().toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.changeShiftFrom && request.changeShiftFrom.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.changeShiftTo && request.changeShiftTo.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    this.currentPage = 1; // Reset to first page after applying new filter
    this.paginateRequests();
  }

  /**
   * Pagination Logic: Slices the filtered data to get items for the current page.
   */
  paginateRequests(): void {
    this.totalPages = Math.ceil(this.filteredShiftSwapRequests.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredShiftSwapRequests.length);
    this.paginatedShiftSwapRequests = this.filteredShiftSwapRequests.slice(startIndex, endIndex);
  }

  /**
   * Generates an array of page numbers to display in the pagination control.
   */
  getPages(): number[] {
    const pages: number[] = [];
    let startPage = Math.max(1, this.currentPage - Math.floor(this.pagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + this.pagesToShow - 1);

    // Adjust startPage if endPage doesn't provide enough pagesToShow
    if (endPage - startPage + 1 < this.pagesToShow) {
      startPage = Math.max(1, endPage - this.pagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.paginateRequests();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateRequests();
    }
  }

  /**
   * Triggers the custom confirmation popup for approving a shift swap request.
   * @param request The ShiftSwapRequestResponseDto object for the request to approve.
   */
  triggerApproveConfirmation(request: ShiftSwapRequestResponseDto): void {
    const message = `Are you sure you want to APPROVE the shift swap for ${request.firstName} ${request.lastName} on ${request.shiftDate.toLocaleDateString()} from ${request.changeShiftFrom} to ${request.changeShiftTo}?`;
    this.confirmPopup.show(message);

    // Subscribe with take(1) to ensure the subscription is automatically completed after the first emission
    this.confirmPopup.confirmed.pipe(take(1), takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performApproveShiftSwapRequest(request.shiftRequestId);
      } else {
        this.toastrService.info('Shift swap approval cancelled.', 'Info');
      }
    });
  }

  /**
   * Performs the actual API call to approve a shift swap request after confirmation.
   * @param shiftRequestId The ID of the shift swap request to approve.
   */
  private performApproveShiftSwapRequest(shiftRequestId: string): void {
    this.shiftSwapRequestService.ApproveLeaveRequest(shiftRequestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message, "Success");
            this.GetallEmployeePendingShiftSwapRequests(); // Re-fetch all data, which will then re-filter and re-paginate
          } else {
            this.toastrService.error(response.message, "Error");
          }
        },
        error: (err: HttpErrorResponse) => {
          const errorMsg = err.error?.message ?? 'An error occurred during approval.';
          this.toastrService.error(errorMsg, 'Error');
        }
      });
  }

  /**
   * Triggers the custom confirmation popup for rejecting a shift swap request.
   * @param request The ShiftSwapRequestResponseDto object for the request to reject.
   */
  triggerRejectConfirmation(request: ShiftSwapRequestResponseDto): void {
    const message = `Are you sure you want to REJECT the shift swap for ${request.firstName} ${request.lastName} on ${request.shiftDate.toLocaleDateString()} from ${request.changeShiftFrom} to ${request.changeShiftTo}?`;
    this.confirmPopup.show(message);

    // Subscribe with take(1) to ensure the subscription is automatically completed after the first emission
    this.confirmPopup.confirmed.pipe(take(1), takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performRejectShiftSwapRequest(request.shiftRequestId);
      } else {
        this.toastrService.info('Shift swap rejection cancelled.', 'Info');
      }
    });
  }

  /**
   * Performs the actual API call to reject a shift swap request after confirmation.
   * @param shiftRequestId The ID of the shift swap request to reject.
   */
  private performRejectShiftSwapRequest(shiftRequestId: string): void {
    this.shiftSwapRequestService.RejectLeaveRequest(shiftRequestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message, "Success");
            this.GetallEmployeePendingShiftSwapRequests(); // Re-fetch all data
          } else {
            this.toastrService.error(response.message, "Error");
          }
        },
        error: (err: HttpErrorResponse) => {
          const errorMsg = err.error?.message ?? 'An error occurred during rejection.';
          this.toastrService.error(errorMsg, 'Error');
        }
      });
  }
}