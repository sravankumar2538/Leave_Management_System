import { Component } from '@angular/core'; 
import { AttendanceComponent } from './attendance/attendance.component';
import { TodayAttendanceComponent } from './today-attendance/today-attendance.component';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';

@Component({
  selector: 'app-employee-dashboard',
  imports: [AttendanceComponent,TodayAttendanceComponent,HolidayCalendarComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent {

}
