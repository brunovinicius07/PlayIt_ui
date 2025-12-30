import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { ToastrService } from 'ngx-toastr';

interface SignupForm {
  nameUser: FormControl,
  email: FormControl,
  password: FormControl,
  confirmNewPassword: FormControl
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  providers: [
    LoginService
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm!: FormGroup<SignupForm>;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService
  ) {
    this.signupForm = new FormGroup({
      nameUser: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmNewPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator })
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmNewPassword')?.value;

    if (password && password !== confirmPassword) {
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
    if (this.signupForm.invalid) {
      if (this.signupForm.hasError('passwordMismatch') || this.signupForm.get('confirmNewPassword')?.hasError('passwordMismatch')) {
        this.toastService.error("As senhas não coincidem");
      } else {
        this.toastService.error("Preencha corretamente todos os campos");
      }
      return;
    }

    this.loginService.signup(
      this.signupForm.value.nameUser!,
      this.signupForm.value.email!,
      this.signupForm.value.password!,
      this.signupForm.value.confirmNewPassword!
    ).subscribe({
      next: () => {
        this.toastService.info("Verifique seu e-mail para ativar a conta.");
        this.router.navigate(["/verify-code"], { queryParams: { email: this.signupForm.value.email, initial: 'true' } });
      },
      error: (err) => { // Melhor tratamento de erro
        this.toastService.error("Erro ao criar conta. Tente novamente.");
      }
    });

  }

  navigate() {
    this.router.navigate(["/login"])
  }
}
