import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleEventService {

  private readonly API = 'http://localhost:8082/v1/schedule/event';

  constructor(private http: HttpClient) {}

  createEvent(payload: any): Observable<any> {
    return this.http.post(`${this.API}/post`, payload);
  }

  updateEvent(eventId: string, payload: any): Observable<any> {
    return this.http.put(`${this.API}/put/${eventId}`, payload);
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(
      `${this.API}/delete/${eventId}`,
      { responseType: 'text' }
    );
  }

  getEventsByDay(userId: number, day: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/day`, {
      params: {
        userId: userId.toString(),
        day
      }
    });
  }

  getDaysWithEvents(userId: number, year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.API}/month`, {
      params: {
        userId: userId.toString(),
        year: year.toString(),
        month: month.toString()
      }
    });
  }

  getEventsByRange(userId: number, start: string, end: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/range`, {
      params: {
        userId: userId.toString(),
        start,
        end
      }
    });
  }
}
