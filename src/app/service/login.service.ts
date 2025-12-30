import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) { }
  apiUrl: string = "http://localhost:8080/v1/music/auth";

  login(email: string, password: string) {
    return this.httpClient
      .post<LoginResponse>(this.apiUrl + "/login", { email, password })
      .pipe(
        tap((value) => {
          localStorage.setItem("auth-token", value.token);
          localStorage.setItem("idUser", String(value.idUser));
          localStorage.setItem("username", value.nameUser);
          localStorage.setItem("role", value.role);

        })
      );
  }

  signup(nameUser: string, email: string, password: string, confirmNewPassword: string) {
    return this.httpClient.post<LoginResponse>(
      this.apiUrl + "/register",
      { nameUser, email, password, confirmNewPassword }
    ).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token);
        localStorage.setItem("idUser", String(value.idUser));
        localStorage.setItem("username", value.nameUser);
        localStorage.setItem("role", value.role);
      })
    );
  }

  verifyCode(email: string, code: string) {
    const params = new HttpParams()
      .set('email', email)
      .set('code', code);

    return this.httpClient.post(
      `${this.apiUrl}/verify`,
      {},
      { params, responseType: 'text' }
    );
  }

  resendCode(email: string) {
    const params = new HttpParams().set('email', email);

    return this.httpClient.post(
      `${this.apiUrl}/resend-code`,
      {},
      { params, responseType: 'text' }
    );
  }

  forgotPassword(email: string): Observable<string> {
    return this.httpClient.put(
      this.apiUrl + "/forgotPassword",
      { email },
      { responseType: 'text' as const }
    );
  }

  resetPassword(data: any) {
    return this.httpClient.put(
      this.apiUrl + "/resetPassword",
      data,
      { responseType: 'text' as const }
    );
  }
}
