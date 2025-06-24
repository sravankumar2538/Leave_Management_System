import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AttendanceService } from '../Attendance/attendance.service';
import { EmployeeAttendanceResponseDto } from '../Attendance/Dtos/EmployeeAttendanceResponseDto';
import { ApiResponse } from '../../shared/api-response.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-attendance-report',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './employee-attendance-report.component.html',
  styleUrl: './employee-attendance-report.component.css'
})
export class EmployeeAttendanceReportComponent implements OnInit {
  fromDate: string | undefined;
  toDate: string | undefined;

  attendanceData: EmployeeAttendanceResponseDto[] | null = null; // All fetched data
  filteredAttendanceData: EmployeeAttendanceResponseDto[] = []; // Data after search filter
  paginatedAttendanceData: EmployeeAttendanceResponseDto[] = []; // Data for current page

  // Dedicated error/message flags and strings
  isLoading: boolean = false;
  hasDateError: boolean = false;
  dateErrorMessage: string | null = null;
  hasApiError: boolean = false;
  apiErrorMessage: string | null = null;
  noRecordsFoundForDates: boolean = false; // When API returns empty for selected dates
  noSearchResults: boolean = false; // When search term yields no results from existing data

  searchTerm: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private readonly attendanceService: AttendanceService, private readonly toastrService: ToastrService) { }

  ngOnInit(): void {
    // Optional: Set default dates if needed, or leave undefined to force user selection
    // this.setDefaultDates();
  }

  /**
   * Clears all message-related flags and strings.
   * Call this at the beginning of actions that might change data state (e.g., fetch, reset).
   */
  private clearAllMessages(): void {
    this.hasDateError = false;
    this.dateErrorMessage = null;
    this.hasApiError = false;
    this.apiErrorMessage = null;
    this.noRecordsFoundForDates = false;
    this.noSearchResults = false;
  }

  /**
   * Validates the selected date range.
   * Sets hasDateError and dateErrorMessage if dates are invalid.
   * @returns true if dates are valid, false otherwise.
   */
  private validateDates(): boolean {
    this.clearAllMessages(); // Clear all messages before validation
    if (!this.fromDate || !this.toDate) {
      this.hasDateError = true;
      this.dateErrorMessage = "Please select both 'From' and 'To' dates.";
      return false;
    }

    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);

    if (from > to) {
      this.hasDateError = true;
      this.dateErrorMessage = "The 'From' date cannot be after the 'To' date.";
      return false;
    }
    return true;
  }

  getAttendance(): void {
    // Clear all previous messages when a new attendance fetch is initiated
    this.clearAllMessages();

    if (!this.validateDates()) {
      // If dates are invalid, validateDates already sets the error message and flag.
      // Clear previous data and update pagination to reflect empty state.
      this.attendanceData = null;
      this.filteredAttendanceData = [];
      this.updatePaginationAndDisplayData();
      return;
    }

    this.attendanceData = null; // Clear existing data before new fetch
    this.filteredAttendanceData = [];
    this.isLoading = true; // Set loading to true when request starts

    this.attendanceService.GetEmployeeAttendanceInDateRangByEmployeeId(this.fromDate!, this.toDate!).subscribe({
      next: (response: ApiResponse<EmployeeAttendanceResponseDto[]>) => {
        this.isLoading = false; // Set loading to false when response is received
        if (response.isSuccess && response.data) {
          this.attendanceData = response.data;
          this.searchTerm = ''; // Clear search term on new successful fetch
          this.updatePaginationAndDisplayData(); // Update filtered and paginated data

          // If API call was successful but returned no data for the selected date range
          if (this.attendanceData.length === 0) {
            this.noRecordsFoundForDates = true;
          }
        } else {
          // If API call was not successful (e.g., isSuccess is false)
          this.attendanceData = null;
          this.filteredAttendanceData = [];
          this.updatePaginationAndDisplayData();
          this.hasApiError = true;
          this.apiErrorMessage = response.message || "Failed to fetch attendance data. Please try again.";
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false; // Set loading to false on error
        this.attendanceData = null;
        this.filteredAttendanceData = [];
        this.updatePaginationAndDisplayData();
        this.hasApiError = true; // Set API error flag

        // Determine user-friendly error message
        let userFriendlyMessage = "An unexpected error occurred while fetching attendance data.";
        if (error.status === 0) {
          userFriendlyMessage = "Network error: Please check your internet connection.";
        } else if (error.status >= 400 && error.status < 500) {
          userFriendlyMessage = (error.error?.message ?? error.message) ?? "Invalid request or data not found.";
        } else if (error.status >= 500) {
          userFriendlyMessage = "Server error: Please try again later.";
        }
        this.apiErrorMessage = userFriendlyMessage;
      }
    });
  }

  /**
   * Filters attendance data based on the search term.
   * This method now ONLY filters and returns the *full* filtered array.
   */
  private filterAttendanceData(): EmployeeAttendanceResponseDto[] {
    if (!this.attendanceData || this.searchTerm === '') {
      return this.attendanceData || [];
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    return this.attendanceData.filter(record => {
      // Format the date to DD-MM-YYYY for search consistency
      const dateParts = record.date ? record.date.split('-') : [];
      let formattedDateForSearch = '';
      if (dateParts.length === 3) {
        formattedDateForSearch = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // DD-MM-YYYY
      }

      // Check if formatted date or work hours include the search term
      return formattedDateForSearch.includes(lowerCaseSearchTerm) ||
        (record.workHours?.toString().includes(lowerCaseSearchTerm) ?? false);
    });
  }

  /**
   * Updates filtered data, calculates pagination, and sets paginated data.
   * This should be called whenever `attendanceData` or `searchTerm` changes.
   */
  updatePaginationAndDisplayData(): void {
    this.filteredAttendanceData = this.filterAttendanceData();
    this.totalItems = this.filteredAttendanceData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // Ensure current page is valid after filtering
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1; // Reset to 1 if no pages
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAttendanceData = this.filteredAttendanceData.slice(startIndex, endIndex);

    // Set no search results flag if a search term is active and no results are found among the original data
    this.noSearchResults = (
      this.searchTerm !== '' &&
      this.attendanceData !== null &&
      this.attendanceData.length > 0 &&
      this.filteredAttendanceData.length === 0
    );

    // If data is successfully displayed (i.e., table is not empty), clear all other specific messages
    if (!this.isLoading && this.paginatedAttendanceData.length > 0) {
        this.clearAllMessages();
    }
    // If no search results, but original data was present, ensure noRecordsFoundForDates is false
    else if (this.searchTerm !== '' && this.attendanceData !== null && this.attendanceData.length > 0) {
        this.noRecordsFoundForDates = false;
    }
  }

  // Handle search input changes
  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page on new search
    this.updatePaginationAndDisplayData();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginationAndDisplayData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginationAndDisplayData();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginationAndDisplayData();
    }
  }

  // Generates an array of page numbers to display in the pagination control
  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // Adjust as needed
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  resetForm(): void {
    this.fromDate = undefined;
    this.toDate = undefined;
    this.attendanceData = null;
    this.searchTerm = '';
    this.isLoading = false;
    // Reset pagination
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
    this.filteredAttendanceData = [];
    this.paginatedAttendanceData = [];
    this.clearAllMessages(); // Clear all message flags and strings
  }
}