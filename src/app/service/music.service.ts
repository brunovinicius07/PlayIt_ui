import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MusicService {
    private apiUrl = 'http://localhost:8080/v1/music/musics';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth-token');
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        });
    }

    addMusic(url: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cipher`, { url }, { headers: this.getHeaders() });
    }

    getLibrary(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/library`, { headers: this.getHeaders() });
    }

    getMusicDetail(idUserMusic: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/library/${idUserMusic}`, { headers: this.getHeaders() });
    }

    updateTone(idUserMusic: number, newTone: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/library/${idUserMusic}/tone`, { newTone }, { headers: this.getHeaders() });
    }

    getMusic(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    deleteMusic(idUserMusic: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/library/${idUserMusic}`, { headers: this.getHeaders() });
    }
}
