import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ShiftSwapRequestResponseDto } from "../ShiftSwapRequest/Dtos/ShiftSwapRequestResponseDto";
import { ShiftSwapRequestService } from "../ShiftSwapRequest/shift-swap-request.service";
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../shared/api-response.interface';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PopupComponent } from '../../shared/popup/popup.component';
import { UpdateShiftSwapRequestDto } from '../ShiftSwapRequest/Dtos/UpdateShiftSwapRequestDto'; // Ensure this is imported

// Interface for the form model used to bind data in the update modal.
interface UpdateShiftSwapFormModel {
  shiftRequestId: string | null;
  shiftDate: Date | null;
  changeShiftFrom: string;
  changeShiftTo: string;
}

@Component({
  selector: 'app-employee-shift-swap',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    PopupComponent
  ],
  templateUrl: './employee-shift-swap.component.html',
  styleUrl: './employee-shift-swap.component.css'
})
export class EmployeeShiftSwapComponent implements OnInit, OnDestroy {
  employeeShiftSwapRequests: ShiftSwapRequestResponseDto[] = [];
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  showShiftSwapUpdateModal: boolean = false;
  isUpdating: boolean = false;

  updateShiftSwapFormModel: UpdateShiftSwapFormModel = {
    shiftRequestId: null,
    shiftDate: null,
    changeShiftFrom: "",
    changeShiftTo: ""
  };

  // NEW PROPERTY: This will hold the single shift option for the update dropdown
  singleAvailableUpdateShift: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // You can adjust this value
  totalPages: number = 0;
  paginatedShiftSwapRequests: ShiftSwapRequestResponseDto[] = [];

  // Search properties
  searchTerm: string = '';
  filteredShiftSwapRequests: ShiftSwapRequestResponseDto[] = [];
  noSearchResults: boolean = false; // Flag to indicate no results after search filtering

  private readonly destroy$ = new Subject<void>();

  @ViewChild('shiftSwapConfirmPopup') shiftSwapConfirmPopup!: PopupComponent;
  @ViewChild('shiftSwapUpdateConfirmPopup') shiftSwapUpdateConfirmPopup!: PopupComponent;

  constructor(
    private readonly shiftSwapRequestService: ShiftSwapRequestService,
    private readonly toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getEmployeeSwapRequestStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getEmployeeSwapRequestStatus(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.noSearchResults = false; // Reset search flag on new data fetch

    this.shiftSwapRequestService.ShiftSwapStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<ShiftSwapRequestResponseDto[]>) => {
          this.isLoading = false;

          if (response.isSuccess) {
            if (response.data && response.data.length > 0) {
              this.employeeShiftSwapRequests = response.data.map(item => ({
                ...item,
                shiftDate: new Date(item.shiftDate),
                timeStamp: new Date(item.timeStamp)
              }));
              this.applySearchFilter(); // Apply search and pagination after data is loaded
            } else {
              this.employeeShiftSwapRequests = [];
              this.filteredShiftSwapRequests = []; // Ensure filtered is also empty
              this.paginatedShiftSwapRequests = []; // Ensure paginated is also empty
              this.totalPages = 0;
              this.currentPage = 1;
              this.hasError = false; // Not an error, just no data
              this.errorMessage = 'No shift swap request data found.'; // Specific message for no data
            }
          } else {
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve shift swap requests due to an unknown issue.';
            this.employeeShiftSwapRequests = [];
            this.filteredShiftSwapRequests = [];
            this.paginatedShiftSwapRequests = [];
            this.totalPages = 0;
            this.currentPage = 1;
            this.noSearchResults = false; // Not a search issue, but an API error
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.employeeShiftSwapRequests = [];
          this.filteredShiftSwapRequests = [];
          this.paginatedShiftSwapRequests = [];
          this.totalPages = 0;
          this.currentPage = 1;
          this.noSearchResults = false; // Not a search issue, but an API error

          let userErrorMessage: string;
          if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            userErrorMessage = (error.error).message;
          } else if (error.status === 0) {
            userErrorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
          } else if (error.status >= 400 && error.status < 500) {
            userErrorMessage = `We couldn't process your request. Please check the information and try again.`;
          } else if (error.status >= 500) {
            userErrorMessage = `Something went wrong on our end. Please try again later.`;
          } else {
            userErrorMessage = 'An unexpected error occurred while fetching shift swap requests.';
          }
          this.errorMessage = userErrorMessage;
        }
      });
  }

  /**
   * Applies the search filter to the employeeShiftSwapRequests and updates filteredShiftSwapRequests.
   * Then, it triggers pagination.
   */
  applySearchFilter(): void {
    if (!this.searchTerm) {
      this.filteredShiftSwapRequests = [...this.employeeShiftSwapRequests];
      this.noSearchResults = false;
    } else {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      this.filteredShiftSwapRequests = this.employeeShiftSwapRequests.filter(request => {
        // Search by Shift Date (formatted), changeShiftFrom, changeShiftTo, Status
        const dateMatch = request.shiftDate.toLocaleDateString('en-GB').toLowerCase().includes(lowerCaseSearchTerm);
        const fromShiftMatch = request.changeShiftFrom.toLowerCase().includes(lowerCaseSearchTerm);
        const toShiftMatch = request.changeShiftTo.toLowerCase().includes(lowerCaseSearchTerm);
        const statusMatch = request.status.toLowerCase().includes(lowerCaseSearchTerm);

        return dateMatch || fromShiftMatch || toShiftMatch || statusMatch;
      });
      this.noSearchResults = this.filteredShiftSwapRequests.length === 0 && this.employeeShiftSwapRequests.length > 0;
    }
    this.currentPage = 1; // Reset to first page on search
    this.calculateTotalPages();
    this.paginateData();
  }

  /**
   * Called when the search input value changes.
   */
  onSearchChange(): void {
    this.applySearchFilter();
  }

  /**
   * Calculates the total number of pages based on filtered data and items per page.
   */
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredShiftSwapRequests.length / this.itemsPerPage);
    // Ensure current page is not beyond total pages if data changes (e.g., filtering)
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1; // If no data, default to page 1
    }
  }

  /**
   * Slices the filtered data to get only the items for the current page.
   */
  paginateData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedShiftSwapRequests = this.filteredShiftSwapRequests.slice(startIndex, endIndex);
  }

  /**
   * Navigates to a specific page.
   * @param page The page number to navigate to.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateData();
    }
  }

  /**
   * Navigates to the first page.
   */
  firstPage(): void {
    if (this.currentPage > 1) {
      this.currentPage = 1;
      this.paginateData();
    }
  }

  /**
   * Navigates to the previous page.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateData();
    }
  }

  /**
   * Navigates to the next page.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateData();
    }
  }

  /**
   * Navigates to the last page.
   */
  lastPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.totalPages;
      this.paginateData();
    }
  }


  /**
   * Generates an array of page numbers to display in the pagination control.
   * Shows a maximum of `maxPagesToShow` around the current page.
   */
  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // e.g., show 5 page numbers at a time
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage is at totalPages limit but not enough pages are shown
    if (endPage - startPage + 1 < maxPagesToShow && this.totalPages >= maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Triggers the custom confirmation popup for canceling a shift swap request.
   * @param request The ShiftSwapRequestResponseDto object for the request being cancelled.
   */
  triggerShiftSwapCancelConfirmation(request: ShiftSwapRequestResponseDto): void {
    const message = `Are you sure you want to cancel the shift swap request for ${request.shiftDate.toLocaleDateString()} (from ${request.changeShiftFrom} to ${request.changeShiftTo})?`;
    this.shiftSwapConfirmPopup.show(message);

    this.shiftSwapConfirmPopup.confirmed.pipe(takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performCancelShiftSwapRequest(request.shiftRequestId);
      } else {
        this.toastrService.info('Shift swap cancellation discarded.', 'Info');
      }
    });
  }

  /**
   * Performs the actual API call to cancel a shift swap request after confirmation.
   * @param shiftRequestId The ID of the shift swap request to cancel.
   */
  private performCancelShiftSwapRequest(shiftRequestId: string): void {
    this.shiftSwapRequestService.deleteShiftSwapRequest(shiftRequestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message, 'Success');
            this.getEmployeeSwapRequestStatus(); // Refresh table data
          } else {
            this.toastrService.error(response.message || 'Failed to cancel shift swap request.', 'Error');
          }
        },
        error: (error: HttpErrorResponse) => {
          let userErrorMessage: string;
          if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            userErrorMessage = (error.error).message;
          } else if (error.status === 0) {
            userErrorMessage = 'Network error: Could not connect to the server.';
          } else if (error.status >= 400 && error.status < 500) {
            userErrorMessage = `We couldn't cancel your request. Please check if it's still pending.`;
          } else if (error.status >= 500) {
            userErrorMessage = `Something went wrong on our end during cancellation. Please try again later.`;
          } else {
            userErrorMessage = 'An unexpected error occurred during cancellation.';
          }
          this.toastrService.error(userErrorMessage, 'Error');
        }
      });
  }

  /**
   * Opens the update modal and populates it with the selected shift swap request's data.
   * This is called when the "Update" button in the table is clicked.
   * @param request The ShiftSwapRequestResponseDto object for the request to be updated.
   */
  updateShiftSwapRequest(request: ShiftSwapRequestResponseDto): void {
    // Populate the form model with the current request data.
    // Create a copy to avoid direct mutation of the original request object.
    this.updateShiftSwapFormModel = { ...request };

    // --- LOGIC TO DETERMINE THE SINGLE AVAILABLE SHIFT OPTION ---
    const originalFrom = request.changeShiftFrom;
    const originalTo = request.changeShiftTo;

    // Specific rule requested: If original swap was from 'Morning' to 'Night', show 'Afternoon'
    if (originalFrom === 'Morning' && originalTo === 'Night') {
      this.singleAvailableUpdateShift = 'Afternoon';
    } else {
      // General rule for other distinct shift swap combinations
      // Find the third shift that is neither the original 'from' nor the original 'to'.
      const allShifts = ['Morning', 'Afternoon', 'Night'];
      const remainingShifts = allShifts.filter(s => s !== originalFrom && s !== originalTo);

      if (remainingShifts.length > 0) {
        this.singleAvailableUpdateShift = remainingShifts[0];
      } else {
        // Fallback: This case should ideally not happen with valid shift swap data
        // where originalFrom and originalTo are distinct.
        this.singleAvailableUpdateShift = ''; // Or a sensible default like 'Morning'
        this.toastrService.error('Could not determine a unique shift option for update. Invalid shift data.', 'Error');
      }
    }

    // Pre-select the update form model's 'changeShiftTo' with this determined single option.
    // This ensures the dropdown displays the correct selected value immediately.
    this.updateShiftSwapFormModel.changeShiftTo = this.singleAvailableUpdateShift;

    // Show the modal
    this.showShiftSwapUpdateModal = true;
  }

  /**
   * Closes the update modal and resets the form model.
   */
  closeShiftSwapUpdateModal(): void {
    this.showShiftSwapUpdateModal = false;
    this.isUpdating = false; // Reset updating status
    this.updateShiftSwapFormModel = {
      shiftRequestId: null,
      shiftDate: null,
      changeShiftFrom: "",
      changeShiftTo: ""
    };
    this.singleAvailableUpdateShift = ''; // Clear the single option
  }

  /**
   * Triggers the confirmation popup for submitting a shift swap update.
   * This method is called when the form inside the update modal is submitted.
   */
  public triggerSubmitShiftSwapUpdateConfirmation(): void {
    // Client-side validation before showing the confirmation popup
    if (!this.updateShiftSwapFormModel.shiftRequestId) {
      this.toastrService.error('Cannot update request: Shift Request ID is missing.', 'Error');
      return;
    }
    if (!this.updateShiftSwapFormModel.changeShiftTo) {
      this.toastrService.warning('Please select a new shift.', 'Validation Warning');
      return;
    }

    // This check might become redundant if `changeShiftTo` is always a different valid option
    // due to the logic in `updateShiftSwapRequest`, but keeping it for robustness.
    if (this.updateShiftSwapFormModel.changeShiftFrom === this.updateShiftSwapFormModel.changeShiftTo) {
      this.toastrService.warning('Cannot update to the same shift. Please select a different shift.', 'Validation Warning');
      return;
    }

    const message = `Confirm to update shift swap request for ${this.updateShiftSwapFormModel.shiftDate?.toLocaleDateString()} from ${this.updateShiftSwapFormModel.changeShiftFrom} to ${this.updateShiftSwapFormModel.changeShiftTo}?`;
    this.shiftSwapUpdateConfirmPopup.show(message);

    this.shiftSwapUpdateConfirmPopup.confirmed.pipe(takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performSubmitShiftSwapUpdate(); // Proceed with the actual API submission
      } else {
        this.toastrService.info('Shift swap changes discarded', 'Info');
      }
    });
  }

  /**
   * Performs the actual API call to submit the shift swap update form after confirmation.
   * This method is now private and called only after confirmation.
   */
  private performSubmitShiftSwapUpdate(): void {
    this.isUpdating = true; // Set loading state for update operation

    const updateDto: UpdateShiftSwapRequestDto = {
      // Use the non-null assertion operator (!) because we've already validated
      // that updateShiftSwapFormModel.shiftRequestId is not null in triggerSubmitShiftSwapUpdateConfirmation().
      shiftRequestId: this.updateShiftSwapFormModel.shiftRequestId!,
      shiftDate: this.updateShiftSwapFormModel.shiftDate?.toISOString().split('T')[0] ?? '', // Convert Date to YYYY-MM-DD string
      changeShiftFrom: this.updateShiftSwapFormModel.changeShiftFrom,
      changeShiftTo: this.updateShiftSwapFormModel.changeShiftTo
    };

    this.shiftSwapRequestService.updateShiftSwapRequest(updateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          this.isUpdating = false;
          if (response.isSuccess) {
            this.toastrService.success(response.message, 'Update Success');
            this.closeShiftSwapUpdateModal(); // Close modal on success
            this.getEmployeeSwapRequestStatus(); // Refresh table data
          } else {
            this.toastrService.error(response.message || 'Failed to update shift swap request.', 'Update Error');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isUpdating = false;

          let userErrorMessage: string;
          if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            userErrorMessage = (error.error).message;
          } else if (error.status === 0) {
            userErrorMessage = 'Network error: Could not connect to the server for update.';
          } else if (error.status >= 400 && error.status < 500) {
            userErrorMessage = `We couldn't update your request. Please check the shift details.`;
          } else if (error.status >= 500) {
            userErrorMessage = `Something went wrong on our end during update. Please try again later.`;
          } else {
            userErrorMessage = 'An unexpected error occurred during the update.';
          }
          this.toastrService.error(userErrorMessage, 'Update Failed');
        }
      });
  }
}