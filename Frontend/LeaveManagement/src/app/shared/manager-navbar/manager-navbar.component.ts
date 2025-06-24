import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'; // Import Router for navigation, RouterLink/RouterOutlet for standalone component imports
import { CommonModule } from '@angular/common'; // Important for common directives like *ngIf, *ngFor (good practice for standalone)
import { EmployeeProfileModalComponent } from '../employee-profile-modal/employee-profile-modal.component';
import { EmployeeListResponseDTO } from '../../features/Employee/Dtos/EmployeeListResponse-payload.dto';
import { EmployeeService } from '../../features/Employee/employee.service';
import { ApiResponse } from '../../shared/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../features/Auth/auth.login.service'; // Import AuthService for logout functionality
 
 
@Component({
  selector: 'app-manager-navbar',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // For basic directives if needed in the future 
    RouterOutlet,
    EmployeeProfileModalComponent
     // For the <router-outlet> tag in the HTML template
     // Import the modal component for use in the template
  ],
  templateUrl: './manager-navbar.component.html',
  styleUrl: './manager-navbar.component.css'
})
export class ManagerNavbarComponent {
  // Property to control the visibility of the manager profile modal
  showProfileModal: boolean = false;
  currentEmployeeProfile: EmployeeListResponseDTO = {
    employeeId: 0,
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    managerId: 0
  };
  isLoadingProfile: boolean = false;
 
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly toastrService: ToastrService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
 
  // Trigger this method when "View Profile" is clicked
  fetchAndOpenEmployeeProfile(): void {
    this.isLoadingProfile = true;
    this.employeeService.GetEmployeeProfile().subscribe({
      next: (response: ApiResponse<EmployeeListResponseDTO[]>) => {
        this.isLoadingProfile = false;
        if (response.isSuccess && response.data && response.data.length > 0) {
          this.currentEmployeeProfile = response.data[0];
          this.showProfileModal = true; // Open the modal after successful fetch
          document.body.classList.add('modal-open');
        } else {
          this.toastrService.error(response.message || 'Failed to load profile data or no data found.', 'Profile Error');
          this.showProfileModal = false; // Ensure modal is closed if fetch fails
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingProfile = false;
        const errorMessage = error.error?.message ? 'An error occurred while fetching profile.' + error.error.message : 'An error occurred while fetching profile.';
        this.toastrService.error(errorMessage, 'Profile Error');
        this.showProfileModal = false; // Ensure modal is closed on error
      }
    });
  }
  /**
   * Navigates to the Manager Dashboard.
   */
  goToManagerDashboard(): void {
    this.router.navigate(['/manager/dashboard']);
  }
 
  /**
   * Navigates to the Manager Employees page.
   */
  goToManagerEmployees(): void {
    this.router.navigate(['/manager/employees']);
  }
 
  /**
   * Navigates to the Manager Leave Request page.
   */
  goToManagerLeaveRequest(): void {
    this.router.navigate(['/manager/leave-request']);
  }
 
  /**
   * Navigates to the Manager Assigned Shifts page.
   */
  goToManagerShifts(): void {
    this.router.navigate(['/manager/shifts']);
  }
 
  goToAttendanceReport(): void {
    this.router.navigate(['/manager/attendance-report']);
  }
  /**
   * Navigates to the Manager Shift Swap Request page.
   */
  goToManagerShiftSwap(): void {
    this.router.navigate(['/manager/shift-swap']);
  }
 
  goToManagerShiftAssign():void{
    this.router.navigate(['/manager/assignShifts']);
  }
 
  /**
   * Navigates to the Annual Holiday Calendar.
   */
  goToAnnualCalendar(): void {
    this.router.navigate(['/manager/AnnualCalendar']); // This is a common route
  }
 
  /**
   * Navigates to the About page.
   */
  goToAbout(): void {
    this.router.navigate(['/manager/About']); // This is a common route
  }
 
  /**
   * Opens the manager profile modal.
   * You would typically fetch profile data here before showing the modal.
   */
  fetchManagerProfile(): void {
    this.showProfileModal = true;
    // Add logic here to fetch the employee's profile data
  }
 
  /**
   * Closes the manager profile modal.
   */
  closeProfileModal(): void {
    this.showProfileModal = false;
  }
 
  /**
   * Handles the logout action.
   * This would typically involve clearing session data and navigating to the login page.
   */
  goToLogOut(): void {
    this.authService.logout().subscribe({
      next: (response : ApiResponse<string>) => {
      },
      error: (error: HttpErrorResponse) => {
        this.toastrService.error('Failed to log out. Please try again.', 'Logout Error');
      }
    })
    this.toastrService.success( 'Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }
 
}
 