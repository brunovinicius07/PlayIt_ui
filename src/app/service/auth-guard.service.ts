import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    const token = localStorage.getItem('auth-token');

    // 🚫 Se não tiver token → ir para login
    if (!token) {
      return this.router.parseUrl('/login');
    }

    // 🔍 Decodificar token
    const payload = JSON.parse(atob(token.split('.')[1]));

    const now = Math.floor(Date.now() / 1000);

    // ❌ Token expirado → logout automático
    if (payload.exp && payload.exp < now) {
      localStorage.clear();
      return this.router.parseUrl('/login');
    }

    // 🔥 Token válido → permitir rota
    return true;
  }
}
