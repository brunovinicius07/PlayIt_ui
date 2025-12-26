import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockMusicService {

  private apiUrl = 'http://localhost:8080/v1/music/block_music';
  private apiUrlRepertoire = 'http://localhost:8080/v1/music/repertoire';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  /** GET all blocks by user */
  getAllByUser(idUser: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/getAll/${idUser}`,
      { headers: this.getHeaders() }
    );
  }

  /** GET one block by ID */
  getOne(idBlock: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/getById/${idBlock}`,
      { headers: this.getHeaders() }
    );
  }

  /** POST create block */
  create(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/post`,
      data,
      { headers: this.getHeaders() }
    );
  }

  /** PUT update block */
  update(idBlock: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/put/${idBlock}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  /** DELETE block */
  delete(idBlock: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete/${idBlock}`,
      {
        headers: this.getHeaders(),
        responseType: 'text' as const
      }
    );
  }

  /** GET Repertoire by ID */
  getRepertoireById(id: number) {
    return this.http.get(`${this.apiUrlRepertoire}/${id}`, {
      headers: this.getHeaders()
    });
  }

  addMusicToBlock(idBlockMusic: number, idUserMusic: number): Observable<any> {
    const payload = {
      idBlockMusic: idBlockMusic,
      idUserMusic: idUserMusic
    };
    return this.http.put(`${this.apiUrl}/link-music-to-block`, payload, { headers: this.getHeaders() });
  }

  removeMusicFromBlock(idBlockMusic: number, idUserMusic: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/removeMusic/${idBlockMusic}/${idUserMusic}`, { headers: this.getHeaders() });
  }
}

