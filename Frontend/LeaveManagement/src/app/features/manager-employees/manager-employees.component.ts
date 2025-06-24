import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmployeeService } from '../Employee/employee.service';
import { EmployeeListResponseDTO } from '../Employee/Dtos/EmployeeListResponse-payload.dto';
import { ApiResponse } from '../../shared/api-response.interface';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manager-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-employees.component.html',
  styleUrl: './manager-employees.component.css'
})
export class ManagerEmployeesComponent implements OnInit, OnDestroy {

  employeeResponseData: EmployeeListResponseDTO[] = [];
  filteredEmployees: EmployeeListResponseDTO[] = [];
  paginatedEmployees: EmployeeListResponseDTO[] = [];

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  private readonly searchTermSubject = new Subject<string>();
  private _searchTerm: string = '';

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    // Emit new value whenever searchTerm changes
    // The debounceTime and distinctUntilChanged logic is handled in ngOnInit subscription
    this.searchTermSubject.next(value);
  }

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of items to display per page
  totalPages: number = 1;
  pages: number[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.GetAllEmployeesUnderManager();

    this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilterAndPaginate();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTermSubject.complete();
  }

  GetAllEmployeesUnderManager(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.employeeService.getAllEmployeesByManager()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EmployeeListResponseDTO[]>) => {
          this.isLoading = false;
          if (response.isSuccess) {
            if (response.data && Array.isArray(response.data)) {
              this.employeeResponseData = response.data;
              this.applyFilterAndPaginate(); // Apply filter and pagination after initial load
            } else {
              this.hasError = true;
              this.errorMessage = 'Received successful response but no employee data found.';
              this.employeeResponseData = [];
              this.filteredEmployees = [];
              this.paginatedEmployees = [];
              this.updatePaginationDetails(0);
            }
          } else {
            this.hasError = true;
            this.errorMessage = response.message || 'Failed to retrieve employee data due to a backend issue.';
            this.employeeResponseData = [];
            this.filteredEmployees = [];
            this.paginatedEmployees = [];
            this.updatePaginationDetails(0);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.employeeResponseData = [];
          this.filteredEmployees = [];
          this.paginatedEmployees = [];
          this.updatePaginationDetails(0);

          if (error.error instanceof ErrorEvent) {
            this.errorMessage = `Network or client error: ${error.error.message}`;
          } else {
            try {
              const errorBody = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              if (errorBody && errorBody.message) {
                this.errorMessage = errorBody.message;
              } else {
                this.errorMessage = `Server error ${error.status}: ${error.message || error.statusText || 'An unknown error occurred.'}`;
              }
            } catch (e) {
              this.errorMessage = `Server error ${error.status}: ${error.message || error.statusText || 'Failed to parse server error response.'}`;
            }
          }
        }
      });
  }

  applyFilterAndPaginate(): void {
    if (!this.employeeResponseData) {
      this.filteredEmployees = [];
    } else if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredEmployees = [...this.employeeResponseData];
    } else {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.employeeResponseData.filter(employee =>
        // Safely convert employeeId to string before calling toLowerCase()
        (typeof employee.employeeId === 'number' ? employee.employeeId.toString() : employee.employeeId || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (employee.firstName || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (employee.lastName || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (employee.email || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (employee.role || '').toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.currentPage = 1;
    this.updatePaginationDetails(this.filteredEmployees.length);
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
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginationDetails(this.filteredEmployees.length);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginationDetails(this.filteredEmployees.length);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginationDetails(this.filteredEmployees.length);
    }
  }
}