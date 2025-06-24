import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass

import { ApiResponse } from '../../../shared/api-response.interface';
// IMPORTANT: Relying solely on the imported ReportResponseDto from your DTOs folder
import { ReportResponseDto } from '../../Reports/Dtos/ReportResponseDto';
import { ReportService } from '../../Reports/report.service';

@Component({
  selector: 'app-managers-report',
  // Make sure to import CommonModule if this component is standalone and uses ngClass/ngIf
  // For Angular 19+, `imports` array is used for standalone components.
  imports: [CommonModule],
  templateUrl: './managers-report.component.html',
  styleUrl: './managers-report.component.css'
})
export class ManagersReportComponent implements OnInit {

  // Holds the single report data object, initialized as null.
  // This will now correctly use the ReportResponseDto imported from your DTOs folder.
  currentReport: ReportResponseDto | null = null;

  // Constructor to inject the Router and ReportService.
  constructor(
    private readonly router: Router,
    private readonly reportService: ReportService
  ) { }

  // Angular lifecycle hook, called once after the component is initialized.
  ngOnInit(): void {
    this.getEmployeesReport();
  }

  /**
   * Fetches the employee report data from the ReportService.
   * Handles success and error responses from the API.
   */
  getEmployeesReport(): void {
    this.reportService.getEmployeesReport().subscribe({
      next: (response: ApiResponse<ReportResponseDto[]>) => {
        if (response.isSuccess && response.data && response.data.length > 0) {
          // Assuming the API returns an array and we only need the first item
          this.currentReport = response.data[0];
        } 
      },
      error: (error) => {
        // Handle specific error types if needed
        if (error.status === 401) {
          this.currentReport = null;
        }
        // Optionally, set an error message to display in the UI
      }
    });
  }

  /**
   * Determines the CSS class for Pending Leaves text color.
   * - Red ('text-danger') if more than 10.
   */
  getPendingLeavesTextColorClass(): string {
    // Corrected property name from 'pendingLeaveRequests' to 'pendingLeaveRequest'
    if (this.currentReport && this.currentReport.pendingLeaveRequest > 10) {
      return 'text-danger';
    }
    return ''; // Default color (or other color if defined)
  }

  /**
   * Determines the CSS class for Pending Swaps text color.
   * - Red ('text-danger') if more than 10.
   */
  getPendingSwapsTextColorClass(): string {
    // Corrected property name from 'pendingSwapRequests' to 'pendingSwapRequest'
    if (this.currentReport && this.currentReport.pendingSwapRequest > 10) {
      return 'text-danger';
    }
    return ''; // Default color
  }

  /**
   * Determines the CSS class for Total Employees text color.
   * - Always green ('text-success').
   */
  getTotalEmployeesTextColorClass(): string {
    return 'text-success';
  }

  /**
   * Determines the CSS class for Absent Employees text color based on percentage.
   * - Red ('text-danger') if absenteeism is >= 75%.
   * - Orange ('text-orange') if absenteeism is between 25% and <75%.
   * - Green ('text-success') if absenteeism is < 25%.
   */
  getAbsentEmployeesTextColorClass(): string {
    if (!this.currentReport || this.currentReport.totalEmployees === 0) {
      return ''; // Default or handle no data case
    }

    const absentPercentage = (this.currentReport.absentEmployees / this.currentReport.totalEmployees) * 100;

    if (absentPercentage >= 75) {
      return 'text-danger'; // High absenteeism (bad)
    } else if (absentPercentage >= 25 && absentPercentage < 75) {
      return 'text-orange'; // Moderate absenteeism
    } else {
      return 'text-success'; // Low absenteeism (good)
    }
  }

  /**
   * Navigates the user to the leave request page.
   */
  goToLeaveRequest(): void {
    this.router.navigate(['/manager/leave-request']).catch(err => {
    });
  }

  /**
   * Navigates the user to the shift swap request page.
   */
  goToSwapRequest(): void {
    this.router.navigate(['/manager/shift-swap']).catch(err => {
    });
  }

  /**
   * Navigates the user to the employees management page.
   */
  goToEmployees(): void {
    this.router.navigate(['/manager/employees']).catch(err => {
    });
  }

  goToAbsentEmployees(): void {
    this.router.navigate(['/manager/absent-employees']).catch(err => {
    });
  }
}
