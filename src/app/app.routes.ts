import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';

import { AuthGuard } from './service/auth-guard.service';

import { PlaceholderComponent } from './pages/placeholder/placeholder.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { RepertoireComponent } from './pages/repertoire/repertoire.component';

export const routes: Routes = [

  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "signup",
    component: SignupComponent
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: "",
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "dashboard",
        component: DashboardComponent
      },
        {
        path: "repertoire",
        component: RepertoireComponent
      },
      {
        path: "musicas",
        component: PlaceholderComponent
      },
      {
        path: "agenda",
        component: PlaceholderComponent
      },
      {
        path: "profile",
        component: ProfileComponent
      },

      // Redirecionamento padrão
      { path: "", redirectTo: "dashboard", pathMatch: "full" }
    ]
  },

  // Página não encontrada
  { path: "**", redirectTo: "dashboard" }
];
