import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AttendanceService } from '../Attendance/attendance.service';
import { EmployeeAttendanceResponseDto } from '../Attendance/Dtos/EmployeeAttendanceResponseDto';
import { ApiResponse } from '../../shared/api-response.interface';
import { ToastrService } from 'ngx-toastr';

import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manager-attendance-report',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manager-attendance-report.component.html',
  styleUrl: './manager-attendance-report.component.css'
})
export class ManagerAttendanceReportComponent implements OnInit, OnDestroy {
  fromDate: string | undefined;
  toDate: string | undefined;

  allAttendanceData: EmployeeAttendanceResponseDto[] | null = null;
  filteredAttendanceData: EmployeeAttendanceResponseDto[] | null = null;
  paginatedAttendanceData: EmployeeAttendanceResponseDto[] | null = null;

  errorMessage: string | null = null; // Used for validation errors and API errors
  isLoading: boolean = false;
  hasFetchedData: boolean = false; // New flag to track if initial data fetch has occurred

  // Search terms
  private readonly searchTermSubject = new Subject<string>();
  private readonly employeeIdSearchTermSubject = new Subject<string>();
  private _searchTerm: string = '';
  private _employeeIdSearchTerm: string = '';

  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.searchTermSubject.next(value);
  }

  get employeeIdSearchTerm(): string {
    return this._employeeIdSearchTerm;
  }
  set employeeIdSearchTerm(value: string) {
    this._employeeIdSearchTerm = value;
    this.employeeIdSearchTermSubject.next(value);
  }

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pages: number[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly attendanceService: AttendanceService, private readonly toastrService: ToastrService) { }

  ngOnInit(): void {
    this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFiltersAndPaginate();
    });

    this.employeeIdSearchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFiltersAndPaginate();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTermSubject.complete();
    this.employeeIdSearchTermSubject.complete();
  }

  private validateDates(): boolean {
    this.errorMessage = null;
    if (!this.fromDate || !this.toDate) {
      this.errorMessage = "Please select both 'From' and 'To' dates.";
      return false;
    }

    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);

    if (from > to) {
      this.errorMessage = "The 'From' date cannot be after the 'To' date.";
      return false;
    }
    return true;
  }

  getAttendance(): void {
    this.hasFetchedData = false; // Reset this flag at the start of a new fetch

    if (!this.validateDates()) {
      this.allAttendanceData = null;
      this.filteredAttendanceData = null;
      this.paginatedAttendanceData = null;
      this.updatePaginationDetails(0);
      return;
    }

    this.errorMessage = null;
    this.allAttendanceData = null;
    this.filteredAttendanceData = null;
    this.paginatedAttendanceData = null;
    this.isLoading = true;
    this.searchTerm = ''; // Clear search terms on new data fetch
    this.employeeIdSearchTerm = '';


    this.attendanceService.GetEmployeeAttendanceInDateRangByManager(this.fromDate!, this.toDate!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EmployeeAttendanceResponseDto[]>) => {
          this.isLoading = false;
          this.hasFetchedData = true; // Set flag after API response

          if (response.isSuccess && response.data) {
            this.allAttendanceData = response.data;
            this.applyFiltersAndPaginate(); // Apply filters and pagination after data fetch
          } else {
            this.toastrService.error(response.message);
            this.allAttendanceData = null;
            this.filteredAttendanceData = null;
            this.paginatedAttendanceData = null;
            this.errorMessage = response.message || "Failed to fetch attendance data. Please try again.";
            this.updatePaginationDetails(0);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasFetchedData = true; // Still mark as fetched even on error
          this.allAttendanceData = null;
          this.filteredAttendanceData = null;
          this.paginatedAttendanceData = null;
          let userFriendlyMessage = "An unexpected error occurred while fetching attendance data.";
          if (error.status === 0) {
            userFriendlyMessage = "Network error: Please check your internet connection.";
          } else if (error.status >= 400 && error.status < 500) {
            userFriendlyMessage = (error.error?.message ?? error.message) ?? "Invalid request or data not found.";
          } else if (error.status >= 500) {
            userFriendlyMessage = "Server error: Please try again later.";
          }
          this.errorMessage = userFriendlyMessage;
          this.updatePaginationDetails(0);
        }
      });
  }

  applyFiltersAndPaginate(): void {
    if (!this.allAttendanceData) {
      this.filteredAttendanceData = []; // If no data, no filtered data
    } else {
      let tempFilteredRecords = [...this.allAttendanceData];

      if (this.searchTerm && this.searchTerm.trim() !== '') {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
        tempFilteredRecords = tempFilteredRecords.filter(record => {
          const dateParts = record.date ? record.date.split('-') : [];
          let formattedDateForSearch = '';
          if (dateParts.length === 3) {
            formattedDateForSearch = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          }

          return formattedDateForSearch.includes(lowerCaseSearchTerm) ||
            (record.workHours != null && record.workHours.toString().includes(lowerCaseSearchTerm)) ||
            (record.firstName && record.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (record.lastName && record.lastName.toLowerCase().includes(lowerCaseSearchTerm));
        });
      }

      if (this.employeeIdSearchTerm && this.employeeIdSearchTerm.trim() !== '') {
        const lowerCaseEmployeeIdSearchTerm = this.employeeIdSearchTerm.toLowerCase();
        tempFilteredRecords = tempFilteredRecords.filter(record =>
          (record.employeeId != null && record.employeeId.toString().toLowerCase().includes(lowerCaseEmployeeIdSearchTerm))
        );
      }
      this.filteredAttendanceData = tempFilteredRecords;
    }

    this.currentPage = 1; // Always reset to first page after filter
    this.updatePaginationDetails(this.filteredAttendanceData ? this.filteredAttendanceData.length : 0);
  }

  private updatePaginationDetails(totalItems: number): void {
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAttendanceData = this.filteredAttendanceData ? this.filteredAttendanceData.slice(startIndex, endIndex) : [];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginationDetails(this.filteredAttendanceData ? this.filteredAttendanceData.length : 0);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginationDetails(this.filteredAttendanceData ? this.filteredAttendanceData.length : 0);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginationDetails(this.filteredAttendanceData ? this.filteredAttendanceData.length : 0);
    }
  }

  resetForm(): void {
    this.fromDate = undefined;
    this.toDate = undefined;
    this.allAttendanceData = null;
    this.filteredAttendanceData = null;
    this.paginatedAttendanceData = null;
    this.errorMessage = null;
    this._searchTerm = '';
    this._employeeIdSearchTerm = '';
    this.hasFetchedData = false; // Reset this when form is cleared
    this.updatePaginationDetails(0);
    this.isLoading = false;
  }
}