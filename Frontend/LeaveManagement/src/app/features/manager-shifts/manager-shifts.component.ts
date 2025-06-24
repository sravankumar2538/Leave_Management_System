// src/app/features/manager-dashboard/manager-shifts/manager-shifts.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EmployeeShiftService } from '../Shifts/shifts.service';
import { EmployeeShiftsResponseDto } from '../Shifts/dtos/EmployeeShiftResponseDto';
import { ApiResponse } from '../../shared/api-response.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateShiftRequestDto } from '../Shifts/dtos/UpdateShiftAssignDto';
import { ToastrService } from 'ngx-toastr';
import { PopupComponent } from '../../shared/popup/popup.component';

@Component({
  selector: 'app-manager-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PopupComponent],
  templateUrl: './manager-shifts.component.html',
  styleUrl: './manager-shifts.component.css'
})
export class ManagerShiftsComponent implements OnInit, OnDestroy {

  originalEmployeeShifts: EmployeeShiftsResponseDto[] = []; // Stores all fetched shifts
  filteredEmployeeShifts: EmployeeShiftsResponseDto[] = []; // Shifts after applying search filter
  paginatedEmployeeShifts: EmployeeShiftsResponseDto[] = []; // Shifts displayed on the current page

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  searchTerm: string = '';

  isUpdateModalOpen: boolean = false;
  selectedShiftToUpdate: EmployeeShiftsResponseDto | null = null;
  modalShiftTimeFrom: string | null = null;
  modalShiftTimeTo: string | null = null;

  allShiftTimes: string[] = ['Morning', 'Afternoon', 'Night'];
  availableNewShiftTimes: string[] = [];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // You can adjust this value
  totalPages: number = 0;
  pagesToShow: number = 5; // Number of page buttons to display

  private readonly destroy$ = new Subject<void>();

  @ViewChild('updateShiftConfirmPopup') updateShiftConfirmPopup!: PopupComponent;

  constructor(
    private readonly employeeShiftService: EmployeeShiftService,
    private readonly toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.GetEmployeeShiftsByManager();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  GetEmployeeShiftsByManager(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.employeeShiftService.AllEmployeeShiftsByManager()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EmployeeShiftsResponseDto[]>) => {
          this.isLoading = false;

          if (response.isSuccess) {
            if (response.data && Array.isArray(response.data)) {
              this.originalEmployeeShifts = response.data.map(item => ({
                ...item,
                shiftDate: item.shiftDate ? new Date(item.shiftDate) : item.shiftDate
              })) as EmployeeShiftsResponseDto[];

              this.applyFilter(); // Apply filter and pagination after fetching data

              if (this.originalEmployeeShifts.length === 0) {
                this.errorMessage = 'No employee shifts found for you to manage.';
              } else {
                this.hasError = false;
              }
            } else {
              this.hasError = true;
              this.errorMessage = 'Received success response but no valid shift data.';
              this.originalEmployeeShifts = []; // Ensure data is clear
              this.applyFilter();
            }
          } else {
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve shifts due to a backend issue.';
            this.originalEmployeeShifts = []; // Ensure data is clear
            this.applyFilter();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.originalEmployeeShifts = []; // Ensure data is clear
          this.applyFilter(); // Update filtered list to be empty

          let displayErrorMessage = 'An unexpected error occurred while fetching employee shifts.';

          if (error.error && typeof error.error === 'object' && (error.error as any).message) {
            displayErrorMessage = (error.error as any).message;
          } else if (error.status === 0) {
            displayErrorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
          } else if (error.status >= 400 && error.status < 500) {
            displayErrorMessage = `Client error (${error.status}): There was an issue with your request.`;
          } else if (error.status >= 500) {
            displayErrorMessage = `Server error (${error.status}): Something went wrong on the server. Please try again later.`;
          }
          this.errorMessage = displayErrorMessage;
        }
      });
  }

  /**
   * Method to filter shifts based on the single search term,
   * which can include employee ID, name, shift time, or date.
   * After filtering, it calls paginateShifts().
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredEmployeeShifts = [...this.originalEmployeeShifts];
    } else {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      let searchDate: Date | null = null;

      const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{1,2}-\d{1,2}-\d{4}$/;
      if (dateRegex.test(this.searchTerm)) {
        try {
          const parsedDate = new Date(this.searchTerm);
          if (!isNaN(parsedDate.getTime())) {
            searchDate = parsedDate;
          }
        } catch (e) {
          // Continue if date parsing fails
        }
      }

      this.filteredEmployeeShifts = this.originalEmployeeShifts.filter(shift => {
        const matchesText =
          shift.employeeId?.toString().includes(lowerCaseSearchTerm) ||
          shift.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          shift.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
          shift.shiftTime.toLowerCase().includes(lowerCaseSearchTerm);

        let matchesDate = false;
        if (searchDate && shift.shiftDate) {
          matchesDate = shift.shiftDate.getFullYear() === searchDate.getFullYear() &&
                        shift.shiftDate.getMonth() === searchDate.getMonth() &&
                        shift.shiftDate.getDate() === searchDate.getDate();
        } else if (lowerCaseSearchTerm && shift.shiftDate) {
          const formattedShiftDate = new DatePipe('en-US').transform(shift.shiftDate, 'fullDate')?.toLowerCase();
          matchesDate = formattedShiftDate?.includes(lowerCaseSearchTerm) || false;
        }

        return matchesText || matchesDate;
      });
    }

    this.currentPage = 1; // Reset to first page after applying filter
    this.paginateShifts();
  }

  /**
   * Method to clear the search term.
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter(); // Re-apply filter to show all shifts and re-paginate
  }

  /**
   * Pagination Logic
   */
  paginateShifts(): void {
    this.totalPages = Math.ceil(this.filteredEmployeeShifts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredEmployeeShifts.length);
    this.paginatedEmployeeShifts = this.filteredEmployeeShifts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateShifts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateShifts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateShifts();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - Math.floor(this.pagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + this.pagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  openUpdateModal(shift: EmployeeShiftsResponseDto): void {
    this.selectedShiftToUpdate = { ...shift };
    this.modalShiftTimeFrom = shift.shiftTime;
    this.modalShiftTimeTo = null;

    this.availableNewShiftTimes = this.allShiftTimes.filter(
      time => time !== this.modalShiftTimeFrom
    );

    this.isUpdateModalOpen = true;
  }

  closeUpdateModal(): void {
    this.isUpdateModalOpen = false;
    this.selectedShiftToUpdate = null;
    this.modalShiftTimeFrom = null;
    this.modalShiftTimeTo = null;
    this.availableNewShiftTimes = [];
  }

  /**
   * Helper function to get the time range for a given shift name.
   */
  getShiftTimeRange(shiftTime: string): string {
    switch (shiftTime) {
      case 'Morning':
        return '6 AM - 2 PM';
      case 'Afternoon':
        return '2 PM - 10 PM';
      case 'Night':
        return '10 PM - 6 AM';
      default:
        return '';
    }
  }

  /**
   * Triggers the confirmation popup for submitting the shift update.
   */
  public triggerSubmitShiftUpdateConfirmation(): void {
    if (!this.selectedShiftToUpdate?.shiftId || !this.modalShiftTimeTo || !this.selectedShiftToUpdate.shiftDate) {
      this.toastrService.warning('Please select a new shift time and ensure all shift details are available to update.', 'Validation Warning');
      return;
    }

    if (this.modalShiftTimeFrom === this.modalShiftTimeTo) {
      this.toastrService.warning('Cannot update to the same shift. Please select a different shift time.', 'Validation Warning');
      return;
    }

    const message = `Are you sure you want to update the shift for ${this.selectedShiftToUpdate.firstName} ${this.selectedShiftToUpdate.lastName} on ${this.selectedShiftToUpdate.shiftDate?.toLocaleDateString()} from ${this.modalShiftTimeFrom} to ${this.modalShiftTimeTo}?`;
    this.updateShiftConfirmPopup.show(message);

    this.updateShiftConfirmPopup.confirmed.pipe(takeUntil(this.destroy$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.performSubmitShiftUpdate();
      } else {
        this.toastrService.info('Shift update aborted.', 'Info');
      }
    });
  }

  /**
   * Performs the actual API call to update the shift.
   */
  private performSubmitShiftUpdate(): void {
    const updatePayload: UpdateShiftRequestDto = {
      shiftId: this.selectedShiftToUpdate!.shiftId,
      shiftTime: this.modalShiftTimeTo!,
      shiftDate: this.selectedShiftToUpdate!.shiftDate?.toISOString().split('T')[0]! // Format to 'YYYY-MM-DD'
    };

    this.employeeShiftService.UpdateShiftsByManager(updatePayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Shift updated successfully!');
            this.closeUpdateModal();
            this.GetEmployeeShiftsByManager(); // Re-fetch all data, which will then re-filter and re-paginate
          } else {
            this.toastrService.error(response.message || 'Failed to update shift.');
          }
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'An unexpected error occurred while updating the shift. Please try again.';

          if (error.error && (error.error as any).message) {
            errorMessage = (error.error as any).message;
          } else if (error.status === 0) {
            errorMessage = 'Network error: Could not connect to the server.';
          } else if (error.status >= 400 && error.status < 500) {
            errorMessage = `Client error (${error.status}): Invalid data provided.`;
          } else if (error.status >= 500) {
            errorMessage = `Server error (${error.status}): Something went wrong.`;
          }

          this.toastrService.error(errorMessage);
        }
      });
  }
}