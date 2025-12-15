import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleEventService {

  private apiUrl = 'http://localhost:8082/v1/schedule/event';

  constructor(private http: HttpClient) {}

  getEventsByDay(userId: number, day: string): Observable<any[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('day', day);

    return this.http.get<any[]>(`${this.apiUrl}/day`, { params });
  }

  getDaysWithEvents(userId: number, year: number, month: number): Observable<number[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('year', year)
      .set('month', month);

    return this.http.get<number[]>(`${this.apiUrl}/month`, { params });
  }

  createEvent(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/post`, payload);
  }
}
