import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepertoireService {
  private apiUrl = 'http://localhost:8080/v1/music/repertoire';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getAll(idUser: number): Observable<any[]> {
    // back espera POST /{idUser} com body vazio conforme sua controller
    return this.http.post<any[]>(`${this.apiUrl}/${idUser}`, {}, { headers: this.getHeaders() });
  }

  create(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/post`, body, { headers: this.getHeaders() });
  }

  update(idRepertoire: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/put/${idRepertoire}`, body, { headers: this.getHeaders() });
  }

  delete(idRepertoire: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${idRepertoire}`, { headers: this.getHeaders(), responseType: 'text' as const });
  }
}
