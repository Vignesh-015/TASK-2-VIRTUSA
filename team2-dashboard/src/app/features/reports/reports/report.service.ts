
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReportEmployeeResponse {
  id: number;
  fullName: string;
  email: string;
  department: string | null;
  status: string | null;
  joiningDate: string | null;
  roleOrDesignation: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly apiUrl = environment.apiUrl.endsWith('/api')
    ? `${environment.apiUrl}/reports/employees`
    : `${environment.apiUrl}/api/reports/employees`;

  constructor(private http: HttpClient) {}

  public getEmployeeReports(): Observable<ReportEmployeeResponse[]> {
    return this.http.get<ReportEmployeeResponse[]>(this.apiUrl);
  }
}
