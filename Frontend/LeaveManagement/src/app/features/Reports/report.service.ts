import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/api-response.interface';
import { environment } from '../../../environments/environment.developement';
import { ReportResponseDto } from '../Reports/Dtos/ReportResponseDto'; 

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private readonly http: HttpClient) { }
  getEmployeesReport(): Observable<ApiResponse<ReportResponseDto[]>> {
    return this.http.get<ApiResponse<ReportResponseDto[]>>(
        `${environment.apiBaseUrl}/Report`,{ withCredentials: true }
    );

  }
}
