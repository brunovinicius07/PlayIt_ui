import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private api = 'http://localhost:8080/v1/music/user';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getLoggedUser(): Observable<any> {
    const idUser = localStorage.getItem('idUser');

    return this.http.get<any>(
      `${this.api}/get/${idUser}`,
      { headers: this.getHeaders() }
    );
  }
}

