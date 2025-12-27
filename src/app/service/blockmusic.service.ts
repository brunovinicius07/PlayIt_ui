import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockMusicService {

  private apiUrl = 'http://localhost:8080/v1/music/block_music';
  private apiUrlRepertoire = 'http://localhost:8080/v1/music/repertoire';

  constructor(private http: HttpClient) { }



  /** GET all blocks by user */
  getAllByUser(idUser: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/getAll/${idUser}`
    );
  }

  /** GET one block by ID */
  getOne(idBlock: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/getById/${idBlock}`
    );
  }

  /** POST create block */
  create(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/post`,
      data
    );
  }

  /** PUT update block */
  update(idBlock: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/put/${idBlock}`,
      data
    );
  }

  /** DELETE block */
  delete(idBlock: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete/${idBlock}`,
      {
        responseType: 'text' as const
      }
    );
  }

  /** GET Repertoire by ID */
  getRepertoireById(id: number) {
    return this.http.get(`${this.apiUrlRepertoire}/${id}`);
  }

  addMusicToBlock(idBlockMusic: number, idUserMusic: number): Observable<any> {
    const payload = {
      idBlockMusic: idBlockMusic,
      idUserMusic: idUserMusic
    };
    return this.http.put(`${this.apiUrl}/link-music-to-block`, payload);
  }

  removeMusicFromBlock(idBlockMusic: number, idUserMusic: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/removeMusic/${idBlockMusic}/${idUserMusic}`);
  }
}

