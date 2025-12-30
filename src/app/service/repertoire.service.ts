import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepertoireService {
  private apiUrl = 'http://localhost:8080/v1/music/repertoire';

  constructor(private http: HttpClient) { }



  getAll(idUser: number): Observable<any[]> {
    // back espera POST /{idUser} com body vazio conforme sua controller
    return this.http.post<any[]>(`${this.apiUrl}/${idUser}`, {});
  }

  create(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/post`, body);
  }

  update(idRepertoire: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/put/${idRepertoire}`, body);
  }

  delete(idRepertoire: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${idRepertoire}`, { responseType: 'text' as const });
  }
  reorder(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, ids);
  }
}
