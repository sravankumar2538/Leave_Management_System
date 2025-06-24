import { Routes } from '@angular/router';
import { EmployeeAuthGuard } from './core/guards/employee-auth.guards';
import { ManagerAuthGuard } from './core/guards/manager-auth.guards';
import { LoginComponent } from './features/Auth/login/login.component';
import { ErrorPageComponent } from './features/error-page/error-page.component';
import { EmployeeDashboardComponent } from './features/employee-dashboard/employee-dashboard.component';
import { EmployeeLeaveRequestComponent } from './features/employee-leave-request/employee-leave-request.component';
import { LeaveBalanceComponent } from './features/leave-balance/leave-balance.component';
import { AboutComponent } from './features/about/about.component';
import { AnnualCalendarComponent } from './features/annual-calendar/annual-calendar.component';
import { EmployeeShiftsComponent } from './features/employee-shifts/employee-shifts.component';
import { ManagerDashboardComponent } from './features/manager-dashboard/manager-dashboard.component';
import { ManagerLeaveRequestComponent } from './features/manager-leave-request/manager-leave-request.component';
import { EmployeeShiftSwapComponent } from "./features/employee-shift-swap/employee-shift-swap.component";
import { EmployeeLeaveRequestStatusComponent } from './features/employee-leave-request-status/employee-leave-request-status.component';
import { ManagerShiftsComponent } from './features/manager-shifts/manager-shifts.component';
import { ManagerShiftSwapComponent } from './features/manager-shift-swap/manager-shift-swap.component';
import { ManagerEmployeesComponent } from './features/manager-employees/manager-employees.component';
import { ManagerShiftAssignComponent } from './features/manager-shift-assign/manager-shift-assign.component';
import { EmployeeAttendanceReportComponent } from './features/employee-attendance-report/employee-attendance-report.component';
import { ManagerAttendanceReportComponent } from './features/manager-attendance-report/manager-attendance-report.component';
import { ManagerAbsentEmployeesComponent } from './features/manager-absent-employees/manager-absent-employees.component';

// Importing Navbar components
import { EmployeeNavbarComponent } from './shared/employee-navbar/employee-navbar.component'; 
import { ManagerNavbarComponent } from './shared/manager-navbar/manager-navbar.component';   
  
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
 
  // Employee Routes (Parent: EmployeeNavbarComponent)
  {
    path: 'employee', // This path will now load EmployeeNavbarComponent
    component: EmployeeNavbarComponent, 
    canActivate:[EmployeeAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default child route for /employee
      { path: 'dashboard', component: EmployeeDashboardComponent}, // Protecting the dashboard route with EmployeeAuthGuard
      { path: 'leave-request', component: EmployeeLeaveRequestComponent },
      { path: 'leave-balance', component: LeaveBalanceComponent },
      { path: 'shifts', component: EmployeeShiftsComponent },
      { path: 'shift-swap', component: EmployeeShiftSwapComponent },
      { path: "About", component: AboutComponent },
      { path: "AnnualCalendar", component: AnnualCalendarComponent },
      { path: "EmployeeAttendanceReport", component: EmployeeAttendanceReportComponent },
      { path: 'leave-request-status', component: EmployeeLeaveRequestStatusComponent }
    ]
  },

  // Manager Routes (Parent: ManagerNavbarComponent)
  {
    path: 'manager', // This path will now load ManagerNavbarComponent
    component: ManagerNavbarComponent, 
    canActivate:[ManagerAuthGuard],// <--- Assign ManagerNavbar here
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default child route for /manager
      { path: 'dashboard', component: ManagerDashboardComponent }, // Protecting the dashboard route with ManagerAuthGuard
      { path: 'leave-request', component: ManagerLeaveRequestComponent },
      { path: 'shifts', component: ManagerShiftsComponent },
      { path: 'shift-swap', component: ManagerShiftSwapComponent },
      { path: "About", component: AboutComponent },
      { path: "AnnualCalendar", component: AnnualCalendarComponent },
      { path: 'employees', component: ManagerEmployeesComponent },
      { path: 'assignShifts', component: ManagerShiftAssignComponent },
      { path: 'attendance-report', component: ManagerAttendanceReportComponent },
      {path: 'absent-employees', component: ManagerAbsentEmployeesComponent } // Protecting the absent employees route with ManagerAuthGuard
    ]
  },
 
  // Wildcard route for any other invalid paths
  { path: '**', component: ErrorPageComponent } // This will catch all undefined routes and display the error page
];
