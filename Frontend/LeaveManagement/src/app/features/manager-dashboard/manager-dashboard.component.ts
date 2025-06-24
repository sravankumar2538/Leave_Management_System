import { Component } from '@angular/core';
import { PresentEmployeesComponent } from './present-employees/present-employees.component';
import { HolidayCalendarComponent } from '../employee-dashboard/holiday-calendar/holiday-calendar.component';
import { ManagersReportComponent } from './managers-report/managers-report.component';

@Component({
  selector: 'app-manager-dashboard',
  imports: [PresentEmployeesComponent,HolidayCalendarComponent,ManagersReportComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent {

}
