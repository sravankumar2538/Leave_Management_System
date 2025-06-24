import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EmployeeShiftsResponseDto } from '../Shifts/dtos/EmployeeShiftResponseDto';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeShiftService } from '../Shifts/shifts.service';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../shared/api-response.interface';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { ShiftSwapRequestService } from '../ShiftSwapRequest/shift-swap-request.service';
import { PostShiftSwapRequestDto } from '../ShiftSwapRequest/Dtos/PostShiftSwapRequestDto';
import { PopupComponent } from '../../shared/popup/popup.component';


// Interface for the form model used to bind data in the new swap request modal.
interface NewShiftSwapFormModel {
    shiftId: string;
    shiftDate: Date | null;
    currentShiftTime: string;
    changeShiftTo: string;
}

@Component({
    selector: 'app-employee-shifts',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PopupComponent
    ],
    templateUrl: './employee-shifts.component.html',
    styleUrl: './employee-shifts.component.css'
})
export class EmployeeShiftsComponent implements OnInit, OnDestroy {

    // Original data fetched from the API
    EmployeeShiftResponseData: EmployeeShiftsResponseDto[] = [];
    // Data filtered by search term
    filteredShiftData: EmployeeShiftsResponseDto[] = [];
    // Data for the current page after filtering and pagination
    paginatedShiftData: EmployeeShiftsResponseDto[] = [];


    isLoading: boolean = false;
    hasError: boolean = false;
    errorMessage: string = '';

    showShiftSwapRequestModal: boolean = false;
    isSubmittingSwap: boolean = false;

    newShiftSwapFormModel: NewShiftSwapFormModel = {
        shiftId: "",
        shiftDate: null,
        currentShiftTime: "",
        changeShiftTo: ""
    };

    // Search and Pagination properties
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10; // You can adjust this number
    totalItems: number = 0;
    totalPages: number = 0;

    private readonly destroy$ = new Subject<void>();

    @ViewChild('swapConfirmPopup') swapConfirmPopup!: PopupComponent;

    constructor(
        private readonly employeeShiftService: EmployeeShiftService,
        private readonly router: Router,
        private readonly toastrService: ToastrService,
        private readonly shiftSwapRequestService: ShiftSwapRequestService
    ) { }

    ngOnInit(): void {
        this.getEmployeeShiftDetails();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Clears all message-related flags and strings.
     * Call this at the beginning of actions that might change data state (e.g., fetch, reset).
     */
    private clearAllMessages(): void {
        this.hasError = false;
        this.errorMessage = '';
    }

    // --- Error Handling for Data Fetching ---
    getEmployeeShiftDetails(): void {
        this.clearAllMessages(); // Clear any previous messages
        this.isLoading = true;
        this.EmployeeShiftResponseData = []; // Clear existing data before new fetch
        this.searchTerm = ''; // Clear search term on new data fetch

        this.employeeShiftService.ShiftsOfAnEmployee()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: ApiResponse<EmployeeShiftsResponseDto[]>) => {
                    this.isLoading = false;

                    if (response.isSuccess) {
                        this.EmployeeShiftResponseData = response.data || [];

                        // Normalize data (e.g., convert shiftDate to Date object, trim status)
                        this.EmployeeShiftResponseData = this.EmployeeShiftResponseData.map(shift => ({
                            ...shift,
                            shiftDate: new Date(shift.shiftDate),
                            status: shift.status ? shift.status.trim() as EmployeeShiftsResponseDto['status'] : null
                        }));

                        // After fetching, update filtered and paginated data
                        this.updateFilteredAndPaginatedData();

                        if (this.EmployeeShiftResponseData.length === 0) {
                            // This specific message is handled by the *ngIf in HTML
                            // We don't need to set hasError = true for "no shifts found" from the API
                            // as it's a valid empty state, not an error.
                            // this.hasError = true;
                            // this.errorMessage = 'No shifts available for you.';
                        }
                    } else {
                        this.hasError = true;
                        this.errorMessage = response.message || 'Failed to retrieve shifts due to an application error.';
                        this.EmployeeShiftResponseData = []; // Ensure data is empty on API failure
                        this.updateFilteredAndPaginatedData(); // Clear tables as well
                    }
                },
                error: (error: HttpErrorResponse) => {
                    this.isLoading = false;
                    this.hasError = true;
                    this.EmployeeShiftResponseData = []; // Ensure data is empty on error
                    this.updateFilteredAndPaginatedData(); // Clear tables as well

                    if (error.status === 0) {
                        this.errorMessage = 'Network error: Please check your internet connection or try again later.';
                        this.toastrService.error(this.errorMessage, 'Connection Error');
                    } else if (error.status === 404) {
                        this.errorMessage = 'The requested shifts data could not be found';
                        this.toastrService.warning(this.errorMessage, 'Not Found');
                    } else if (error.status >= 400 && error.status < 500) {
                        this.errorMessage = error.error?.message ?? `Error ${error.status}: Client-side issue.`
                        this.toastrService.error(this.errorMessage, 'Request Error');
                    } else if (error.status >= 500 && error.status < 600) {
                        this.errorMessage = error.error?.message ?? `Error ${error.status}: Server issue. Please try again later.`;
                        this.toastrService.error(this.errorMessage, 'Server Error');
                    } else {
                        this.errorMessage = 'An unexpected error occurred. Please try again later.';
                        this.toastrService.error(this.errorMessage, 'Unknown Error');
                    }
                }
            });
    }

    /**
     * Filters the original shift data based on the search term.
     * @returns An array of filtered EmployeeShiftsResponseDto.
     */
    private filterShiftData(): EmployeeShiftsResponseDto[] {
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            return this.EmployeeShiftResponseData;
        }

        const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();

        return this.EmployeeShiftResponseData.filter(shift => {
            const shiftDateString = shift.shiftDate.toLocaleDateString('en-GB'); // e.g., "18/06/2025"
            const shiftTimeString = shift.shiftTime.toLowerCase(); // "Morning", "Afternoon", "Night"

            return shiftDateString.includes(lowerCaseSearchTerm) ||
                   shiftTimeString.includes(lowerCaseSearchTerm);
        });
    }

    /**
     * Updates the `filteredShiftData` and `paginatedShiftData` arrays,
     * and recalculates pagination properties.
     * This method should be called after fetching new data or when the search term changes.
     */
    updateFilteredAndPaginatedData(): void {
        this.filteredShiftData = this.filterShiftData();
        this.totalItems = this.filteredShiftData.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

        // Adjust current page if it's out of bounds after filtering
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        } else if (this.totalPages === 0) {
            this.currentPage = 1; // Reset to 1 if no pages exist
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedShiftData = this.filteredShiftData.slice(startIndex, endIndex);
    }

    /**
     * Handles changes in the search input field.
     * Resets to the first page and updates the displayed data.
     */
    onSearchChange(): void {
        this.currentPage = 1; // Always go to the first page when search term changes
        this.updateFilteredAndPaginatedData();
    }


    // --- Pagination Methods ---
    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updateFilteredAndPaginatedData();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateFilteredAndPaginatedData();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateFilteredAndPaginatedData();
        }
    }

    /**
     * Generates an array of page numbers to display in the pagination control.
     * @returns An array of numbers representing the pages.
     */
    getPages(): number[] {
        const pages: number[] = [];
        const maxPagesToShow = 5; // Adjust as needed
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

        // Adjust startPage if endPage hits totalPages but we don't have enough pages to fill maxPagesToShow
        if (endPage - startPage + 1 < maxPagesToShow && this.totalPages > maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    /**
     * Handles the shift swap action for a specific shift.
     * Populates the `newShiftSwapFormModel` with details of the selected shift
     * and opens the new shift swap request modal.
     * @param event The DOM event object, used to stop propagation.
     * @param shift The `EmployeeShiftsResponseDto` object for the shift to be swapped.
     */
    onSwapShift(event: Event, shift: EmployeeShiftsResponseDto): void {
        event.stopPropagation();

        // Only allow swap if the status is not 'Pending', 'Approved', or 'Rejected'
        if (shift.status === 'Pending' || shift.status === 'Approved' || shift.status === 'Rejected') {
            this.toastrService.info(`Cannot swap this shift as its status is **${shift.status}**.`, 'Swap Not Allowed');
            return; // Stop execution if conditions are met
        }

        this.newShiftSwapFormModel = {
            shiftId: shift.shiftId,
            shiftDate: shift.shiftDate ? new Date(shift.shiftDate) : null,
            currentShiftTime: shift.shiftTime,
            changeShiftTo: ""
        };
        this.showShiftSwapRequestModal = true;
    }

    /**
     * Closes the new shift swap request modal and resets its form model to default values.
     */
    closeShiftSwapRequestModal(): void {
        this.showShiftSwapRequestModal = false;
        this.isSubmittingSwap = false;

        this.newShiftSwapFormModel = {
            shiftId: "",
            shiftDate: null,
            currentShiftTime: "",
            changeShiftTo: ""
        };
    }

    /**
     * Triggers the custom confirmation popup before submitting the shift swap request.
     */
    triggerSubmitShiftSwapConfirmation(): void {
        if (!this.newShiftSwapFormModel.shiftId || !this.newShiftSwapFormModel.currentShiftTime || !this.newShiftSwapFormModel.changeShiftTo) {
            this.toastrService.warning('Please ensure all fields are filled to request a shift swap.', 'Missing Information');
            return;
        }

        if (this.newShiftSwapFormModel.currentShiftTime === this.newShiftSwapFormModel.changeShiftTo) {
            this.toastrService.warning('The "Change Shift To" time cannot be the same as your current shift time. Please select a different time.', 'Invalid Selection');
            return;
        }

        const message = `Are you sure you want to request a shift swap for **${this.newShiftSwapFormModel.shiftDate?.toLocaleDateString()}** from **${this.newShiftSwapFormModel.currentShiftTime}** to **${this.newShiftSwapFormModel.changeShiftTo}**?`;
        this.swapConfirmPopup.show(message);

        this.swapConfirmPopup.confirmed.pipe(
            take(1),
            takeUntil(this.destroy$)
        ).subscribe((isConfirmed: boolean) => {
            if (isConfirmed) {
                this.performSubmitShiftSwapRequest();
            } else {
                this.toastrService.info('Shift swap request cancelled.', 'Cancelled');
            }
        });
    }

    /**
     * Performs the actual API call to submit the new shift swap request after confirmation.
     */
    private performSubmitShiftSwapRequest(): void {
        this.isSubmittingSwap = true;

        const postDto: PostShiftSwapRequestDto = {
            shiftId: this.newShiftSwapFormModel.shiftId,
            changeShiftForm: this.newShiftSwapFormModel.currentShiftTime,
            changeShiftTo: this.newShiftSwapFormModel.changeShiftTo,
            shiftDate: this.newShiftSwapFormModel.shiftDate ? this.newShiftSwapFormModel.shiftDate.toISOString().split('T')[0] : ''
        };

        this.shiftSwapRequestService.postShiftSwapRequest(postDto)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: ApiResponse<string>) => {
                    this.isSubmittingSwap = false;

                    if (response.isSuccess) {
                        this.toastrService.success(response.message || 'Shift swap request submitted successfully!', 'Success');
                        this.newShiftSwapFormModel = {
                            shiftId: "",
                            shiftDate: null,
                            currentShiftTime: "",
                            changeShiftTo: ""
                        };
                        this.closeShiftSwapRequestModal();
                        this.getEmployeeShiftDetails(); // Re-fetch data to reflect the change
                        // this.router.navigate(["/employee/shift-swap"]); // Navigating away might be too quick, consider if this is desired
                    } else {
                        this.toastrService.error(response.message || 'Failed to submit shift swap request. Please try again.', 'Submission Failed');
                    }
                },
                error: (error: HttpErrorResponse) => {
                    this.isSubmittingSwap = false;

                    if (error.status === 0) {
                        this.toastrService.error('Network error: Could not connect to the server for shift swap.', 'Connection Error');
                    } else if (error.status >= 400 && error.status < 500) {
                        this.toastrService.error(
                            error.error?.message ?? `Error ${error.status}: Unable to process your request.`, 'Request Error'
                        );
                    } else if (error.status >= 500 && error.status < 600) {
                        this.toastrService.error(
                            error.error?.message ?? `Error ${error.status}: Server encountered an issue.`, 'Server Error'
                        );
                    } else {
                        this.toastrService.error('An unexpected error occurred during shift swap. Please try again.', 'Unknown Error');
                    }
                }
            });
    }
}