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
import { BlockMusicComponent } from './pages/blockmusic/blockmusic.component';
import { BlockDetailComponent } from './pages/block-detail/block-detail.component';

import { ScheduleEventComponent } from './pages/schedule-event/schedule-event.component';



import { MusicComponent } from './pages/music/music.component';
import { MusicListComponent } from './pages/music-list/music-list.component';
import { MusicCipherComponent } from './pages/music-cipher/music-cipher.component';

export const routes: Routes = [

  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password", component: ResetPasswordComponent },

  {
    path: "",
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [

      { path: "dashboard", component: DashboardComponent },

      { path: "repertoire", component: RepertoireComponent },

      { path: "repertoire/:id/blockmusic", component: BlockMusicComponent },
      { path: "repertoire/:id/blockmusic/:idBlock", component: BlockDetailComponent },

      { path: "music", component: MusicComponent },
      { path: "music/cipher/:id", component: MusicCipherComponent },
      { path: "library", component: MusicListComponent },

      { path: "schedule", component: ScheduleEventComponent },

      { path: "profile", component: ProfileComponent },

      { path: "", redirectTo: "dashboard", pathMatch: "full" }
    ]
  },

  { path: "**", redirectTo: "dashboard" }
];
