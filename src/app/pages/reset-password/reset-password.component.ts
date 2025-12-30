import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { CommonModule } from '@angular/common';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PrimaryInputComponent,
    DefaultLoginLayoutComponent
  ]
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  token: string = '';
  showSuccess = false;
  successMessage = '';

  // Timer
  timeLeft: number = 300;
  interval: any;
  displayTime: string = "05:00";
  isExpired = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private router: Router,
    private toastService: ToastrService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer();

    const now = Math.floor(Date.now() / 1000);
    const exp = this.getExpirationFromToken(this.token);

    if (exp) {
      this.timeLeft = exp - now;
    } else {
      // Fallback se não conseguir ler o token (ou não for JWT) - Mantém 5 min por segurança
      this.timeLeft = 300;
    }

    if (this.timeLeft <= 0) {
      this.handleExpiration();
      return;
    }

    this.updateDisplayTime();

    this.interval = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        this.handleExpiration();
      } else {
        this.updateDisplayTime();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.interval) clearInterval(this.interval);
  }

  handleExpiration() {
    this.timeLeft = 0;
    this.isExpired = true;
    this.updateDisplayTime();
    this.stopTimer();
    this.resetForm.disable();
    // Não precisa remover do localStorage pois agora validamos pelo token
  }

  updateDisplayTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.displayTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  getExpirationFromToken(token: string): number | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decodedRequest = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const json = JSON.parse(decodedRequest);

      return json.exp || null;
    } catch (e) {
      return null;
    }
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;

    if (password && password !== confirmNewPassword) {
      control.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
      control.get('confirmNewPassword')?.markAsTouched();
      return { passwordMismatch: true };
    } else {
      const confirmCtrl = control.get('confirmNewPassword');
      if (confirmCtrl?.hasError('passwordMismatch')) {
        confirmCtrl?.setErrors(null);
      }
      return null;
    }
  }

  submit() {
    if (this.isExpired) {
      this.toastService.error("Tempo expirado. Refaça o processo.");
      return;
    }

    if (this.resetForm.invalid) {
      if (this.resetForm.hasError('passwordMismatch') || this.resetForm.get('confirmNewPassword')?.hasError('passwordMismatch')) {
        this.toastService.error("As senhas não coincidem");
      } else {
        this.toastService.error("Preencha corretamente todos os campos");
      }
      return;
    }

    const { newPassword, confirmNewPassword } = this.resetForm.value;

    this.loginService.resetPassword({
      token: this.token,
      newPassword,
      confirmNewPassword
    }).subscribe({
      next: () => {
        this.successMessage = "Senha redefinida com sucesso!";
        this.showSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : "Erro ao redefinir senha");
        alert(msg);
      }
    });
  }

  navigate() {
    this.router.navigate(['/login']);
  }

  retry() {
    this.router.navigate(['/forgot-password']);
  }
}
