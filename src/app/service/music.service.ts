import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MusicService {
    private apiUrl = 'http://localhost:8080/v1/music/musics';

    constructor(private http: HttpClient) { }



    addMusic(url: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cipher`, { url });
    }

    getLibrary(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/library`);
    }

    getMusicDetail(idUserMusic: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/library/${idUserMusic}`);
    }

    updateTone(idUserMusic: number, newTone: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/library/${idUserMusic}/tone`, { newTone });
    }

    getMusic(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    deleteMusic(idUserMusic: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/library/${idUserMusic}`);
    }
}
