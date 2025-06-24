import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/api-response.interface';
import { HolidayCalendarResponseDto } from './Dtos/HolidayResponse.dto';
import { environment } from '../../../environments/environment.developement';

@Injectable({
  providedIn: 'root'
})
export class HolidayCalendarService {

  constructor(private readonly http: HttpClient) { }

  getAnnualHolidays(): Observable<ApiResponse<HolidayCalendarResponseDto[]>> {
    return this.http.get<ApiResponse<HolidayCalendarResponseDto[]>>(
        `${environment.apiBaseUrl}/HolidayCalendar/AnnualHoildays`, { withCredentials: true }
    );
  }

  UpcomingHolidays(): Observable<ApiResponse<HolidayCalendarResponseDto[]>> {
    return this.http.get<ApiResponse<HolidayCalendarResponseDto[]>>(
        `${environment.apiBaseUrl}/HolidayCalendar/UpcomingHoildays`, {withCredentials: true}
    );
}
}
