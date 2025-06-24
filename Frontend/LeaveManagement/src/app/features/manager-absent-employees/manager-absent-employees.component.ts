import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmployeeService } from '../Employee/employee.service';
import { EmployeeListResponseDTO } from '../Employee/Dtos/EmployeeListResponse-payload.dto';
import { ApiResponse } from '../../shared/api-response.interface';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manager-absent-employees',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './manager-absent-employees.component.html',
  styleUrl: './manager-absent-employees.component.css'
})
export class ManagerAbsentEmployeesComponent implements OnInit, OnDestroy {

  employeeResponseData: EmployeeListResponseDTO[] = [];
  filteredEmployees: EmployeeListResponseDTO[] = [];
  paginatedEmployees: EmployeeListResponseDTO[] = []; // Stores employees for the current page

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Default items per page, adjust as needed
  totalPages: number = 1;
  pages: number[] = []; // Array to hold page numbers for display

  // Use a Subject for searchTerm changes to debounce input
  private readonly searchTermSubject = new Subject<string>();
  private _searchTerm: string = ''; // Internal private property for searchTerm

  // Public getter/setter for searchTerm to integrate with NgModel
  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    this.searchTermSubject.next(value); // Emit new value whenever searchTerm changes
  }

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.GetAbsentEmployeesUnderManager();

    // Subscribe to searchTermSubject to apply filter after a delay
    this.searchTermSubject.pipe(
      debounceTime(300), // Wait for 300ms pause in typing
      distinctUntilChanged(), // Only emit if the value is different from the last one
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTermSubject.complete(); // Important: complete the searchTermSubject too
  }

  /**
   * Fetches all absent employees reporting to the current manager from the backend API.
   * Manages loading, success, and error states for the UI.
   */
  GetAbsentEmployeesUnderManager(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.employeeService.getAbsentEmployeesByManager()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EmployeeListResponseDTO[]>) => {
          this.isLoading = false; // Set isLoading to false on success
          if (response.isSuccess) {
            if (response.data && Array.isArray(response.data)) {
              this.employeeResponseData = response.data;
              this.applyFilter(); // Apply filter with initial (empty) searchTerm and then paginate
            } else {
              this.hasError = true;
              this.errorMessage = 'Received successful response but no absent employee data found.';
              this.employeeResponseData = [];
              this.filteredEmployees = [];
              this.paginatedEmployees = []; // Ensure paginated array is also empty
              this.updatePagination(); // Update pagination to reflect no data
            }
          } else {
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve absent employee data due to a backend issue.';
            this.employeeResponseData = [];
            this.filteredEmployees = [];
            this.paginatedEmployees = []; // Ensure paginated array is also empty
            this.updatePagination(); // Update pagination to reflect no data
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false; // Set isLoading to false on error
          this.hasError = true;
          this.employeeResponseData = [];
          this.filteredEmployees = [];
          this.paginatedEmployees = []; // Ensure paginated array is also empty
          this.updatePagination(); // Update pagination to reflect no data

          if (error.error instanceof ErrorEvent) {
            this.errorMessage = `Network or client error: ${error.error.message}`;
          } else {
            // Attempt to parse specific error messages from the server
            try {
              const errorBody = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              if (errorBody && errorBody.message) {
                this.errorMessage = errorBody.message;
              } else {
                this.errorMessage = `Server error ${error.status}: ${error.statusText || 'An unknown error occurred.'}`;
              }
            } catch (e) {
              this.errorMessage = `Server error ${error.status}: ${error.statusText || 'Failed to parse server error response.'}`;
            }
          }
        }
      });
  }

  /**
   * Filters the employee data based on the searchTerm.
   * Filters by employee role, first name, last name, or email (case-insensitive).
   * After filtering, it resets to the first page and applies pagination.
   */
  applyFilter(): void {
    // Ensure employeeResponseData is loaded before filtering
    if (!this.employeeResponseData) {
      this.filteredEmployees = [];
      this.paginatedEmployees = [];
      this.updatePagination();
      return;
    }

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // If search term is empty or just whitespace, show all employees
      this.filteredEmployees = [...this.employeeResponseData];
    } else {
      // Filter by role, first name, last name, or email (case-insensitive)
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.employeeResponseData.filter(employee =>
        employee.role.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
        employee.email.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.currentPage = 1; // Reset to the first page whenever the filter changes
    this.updatePagination(); // Update pagination based on the newly filtered data
  }

  /**
   * Updates pagination properties and the array of page numbers to display.
   * This method implements a logic to show a limited number of page buttons around the current page.
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);

    // Ensure currentPage doesn't exceed new total pages after filter/data change
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 0; // No pages if no data
    } else if (this.currentPage < 1 && this.totalPages > 0) {
      this.currentPage = 1; // If somehow 0 or less, set to 1 if there are pages
    }

    this.pages = [];
    const maxPagesToShow = 5; // Display a maximum of 5 page numbers (e.g., 1, 2, 3, 4, 5)
    let startPage: number, endPage: number;

    if (this.totalPages <= maxPagesToShow) {
      // Less than or equal to max pages total, show all page numbers
      startPage = 1;
      endPage = this.totalPages;
    } else {
      // More than max pages total, calculate start and end pages to center around currentPage
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

      if (this.currentPage <= maxPagesBeforeCurrentPage) {
        // Near the beginning of the page range
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (this.currentPage + maxPagesAfterCurrentPage >= this.totalPages) {
        // Near the end of the page range
        startPage = this.totalPages - maxPagesToShow + 1;
        endPage = this.totalPages;
      } else {
        // In the middle of the page range
        startPage = this.currentPage - maxPagesBeforeCurrentPage;
        endPage = this.currentPage + maxPagesAfterCurrentPage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }

    this.paginateEmployees(); // Slice the filtered employees for the current page
  }

  /**
   * Slices the filteredEmployees array to get employees for the current page.
   */
  paginateEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  /**
   * Changes the current page.
   * @param page The page number to navigate to.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateEmployees();
    }
  }

  /**
   * Handles change in items per page dropdown.
   * @param event The change event from the select element.
   */
  onPageSizeChange(event: Event): void {
    this.itemsPerPage = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1; // Reset to first page when items per page changes
    this.updatePagination();
  }
}
