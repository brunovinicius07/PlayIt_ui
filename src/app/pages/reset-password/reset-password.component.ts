import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { CommonModule } from '@angular/common';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  submit() {
    if (!this.resetForm.valid) return;

    const { newPassword, confirmNewPassword } = this.resetForm.value;

    if (newPassword !== confirmNewPassword) {
      alert("As senhas não coincidem!");
      return;
    }

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
        alert(err.error.message || "Erro ao redefinir senha");
      }
    });
  }

  navigate() {
    this.router.navigate(['/login']);
  }
}
