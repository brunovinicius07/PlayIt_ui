import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleEventService {

  private readonly API = 'http://localhost:8080/v1/music/event';

  constructor(private http: HttpClient) { }

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

  getEventsByDay(day: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/day`, {
      params: {
        day
      }
    });
  }

  getDaysWithEvents(year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.API}/month`, {
      params: {
        year: year.toString(),
        month: month.toString()
      }
    });
  }

  getEventsByRange(start: string, end: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/range`, {
      params: {
        start,
        end
      }
    });
  }
}
