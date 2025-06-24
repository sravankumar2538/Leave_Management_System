import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeProfileModalComponent } from '../employee-profile-modal/employee-profile-modal.component';
import { EmployeeListResponseDTO } from '../../features/Employee/Dtos/EmployeeListResponse-payload.dto';
import { EmployeeService } from '../../features/Employee/employee.service';
import { ApiResponse } from '../../shared/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router'; // Ensure NavigationEnd is imported
import { AuthService } from '../../features/Auth/auth.login.service';
import { filter } from 'rxjs/operators'; // Ensure filter is imported

@Component({
  selector: 'app-employee-navbar',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeProfileModalComponent,
    RouterOutlet
  ],
  templateUrl: './employee-navbar.component.html',
  styleUrl: './employee-navbar.component.css'
})
export class EmployeeNavbarComponent implements OnInit {
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
  activeRoute: string | undefined; // This property tracks the current route for active highlighting

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly toastrService: ToastrService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to update activeRoute whenever navigation completes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // event.urlAfterRedirects gives the clean URL after redirects, which is ideal for comparison
      this.activeRoute = event.urlAfterRedirects;
    });

    // Set initial active route on component load (important for when component loads on an already active route)
    this.activeRoute = this.router.url;
  }

  // ... (rest of your component methods)

  fetchAndOpenEmployeeProfile(): void {
    this.isLoadingProfile = true;
    this.employeeService.GetEmployeeProfile().subscribe({
      next: (response: ApiResponse<EmployeeListResponseDTO[]>) => {
        this.isLoadingProfile = false;
        if (response.isSuccess && response.data && response.data.length > 0) {
          this.currentEmployeeProfile = response.data[0];
          this.showProfileModal = true;
          document.body.classList.add('modal-open');
        } else {
          this.toastrService.error(response.message || 'Failed to load profile data or no data found.', 'Profile Error');
          this.showProfileModal = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingProfile = false;
        const errorMessage = error.error?.message ? 'An error occurred while fetching profile: ' + error.error.message : 'An error occurred while fetching profile.';
        this.toastrService.error(errorMessage, 'Profile Error');
        this.showProfileModal = false;
      }
    });
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    document.body.classList.remove('modal-open');
  }

  // Ensure these navigation methods correctly map to your routes
  goToEmployeeDashboard(): void {
    this.router.navigate(['/employee/dashboard']);
  }

  goTOLeaveRequest(): void {
    this.router.navigate(['/employee/leave-request']);
  }

  goToLeaveRequestStatus(): void {
    this.router.navigate(['/employee/leave-request-status']);
  }

  goToShifts(): void {
    this.router.navigate(['/employee/shifts']);
  }

  goToShiftStatus(): void {
    this.router.navigate(['/employee/shift-swap']);
  }

  goToLeaveBalance(): void {
    this.router.navigate(['employee/leave-balance']);
  }

  goToAnnualCalendar(): void {
    this.router.navigate(['/employee/AnnualCalendar']);
  }

  goToAbout(): void {
    this.router.navigate(['/employee/About']);
  }

  goToLogOut(): void {
    this.authService.logout().subscribe({
      next: (response : ApiResponse<string>) => {
      },
      error: (error: HttpErrorResponse) => {
        this.toastrService.error('Failed to log out. Please try again.', 'Logout Error');
      }
    });
    this.toastrService.success( 'Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }

  goToAttendanceReport():void{
    this.router.navigate(['/employee/EmployeeAttendanceReport']);
  }
}