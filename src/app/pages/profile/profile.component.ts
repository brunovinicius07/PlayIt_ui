import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileService } from '../../service/profile.service.ts.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  form!: FormGroup;

  editMode = false;
  showPasswordFields = false;
  editingPassword = false;

  showImageModal = false;
  showDeleteModal = false;

  // Visibility Flags
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  idUser = localStorage.getItem("idUser");
  userName = localStorage.getItem("username") || "Usuário";

  constructor(
    private profileService: ProfileService,
    private toast: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      nameUser: new FormControl(localStorage.getItem("userName"), Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      changePassword: new FormControl(false),
      currentPassword: new FormControl(''),
      newPassword: new FormControl(''),
      confirmNewPassword: new FormControl('')
    }, { validators: this.passwordMatchValidator });

    this.loadUserData();

    // controla exibição dos campos e movimento do card
    this.form.get("changePassword")?.valueChanges.subscribe((v: boolean) => {
      this.showPasswordFields = v;
      this.editingPassword = v;
      this.updateWrapperMargin();

      // Se desmarcar, limpa os campos de senha
      if (!v) {
        this.form.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    });
  }

  toggleCurrentPassword() { this.showCurrentPassword = !this.showCurrentPassword; }
  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmNewPassword')?.value;

    if (password && password !== confirmPassword) {
      control.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (control.get('confirmNewPassword')?.hasError('passwordMismatch')) {
        control.get('confirmNewPassword')?.setErrors(null);
      }
      return null;
    }
  }

  /* =====================================
     Avatar só aparece se NÃO estiver alterando senha
  ====================================== */
  shouldShowAvatar(): boolean {
    return !this.form.get("changePassword")?.value;
  }

  /* =====================================
     Atualiza posição do card
  ====================================== */
  updateWrapperMargin() {
    const wrapper = document.querySelector('.profile-wrapper');

    if (this.editingPassword) {
      wrapper?.classList.add('editing-password');
    } else {
      wrapper?.classList.remove('editing-password');
    }
  }

  /* =====================================
     Carrega informações do usuário
  ====================================== */
  loadUserData() {
    this.profileService.getUserById(this.idUser!).subscribe({
      next: (u) => {
        this.form.patchValue({
          email: u.email,
          nameUser: u.nameUser
        });
      }
    });
  }

  /* =====================================
     Editar / Cancelar
  ====================================== */
  enableEditMode() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.showPasswordFields = false;
    this.editingPassword = false;

    this.form.patchValue({ changePassword: false });

    this.updateWrapperMargin();
    this.loadUserData();
  }

  /* =====================================
     Salvar
  ====================================== */
  salvar() {
    if (this.form.invalid) {
      this.toast.error("Preencha corretamente, as novas senhas não coincidem");
      return;
    }

    const payload = {
      ...this.form.value,
      isChangePassword: this.form.value.changePassword
    };

    this.profileService.updateUser(this.idUser!, payload).subscribe({
      next: () => {
        this.toast.success("Dados atualizados!");

        // Atualiza localStorage para refletir mudança imediata na Dashboard
        if (this.form.value.nameUser) {
          localStorage.setItem('username', this.form.value.nameUser);
        }

        this.editMode = false;
        this.editingPassword = false;
        this.showPasswordFields = false;

        this.updateWrapperMargin();
      },
      error: (err) => {
        const msg = err.error?.message || "Erro ao atualizar";
        this.toast.error(msg);
      }
    });
  }

  /* =====================================
     Modais
  ====================================== */
  openImageModal() { this.showImageModal = true; }
  closeImageModal() { this.showImageModal = false; }

  openDeleteModal() { this.showDeleteModal = true; }
  closeDeleteModal() { this.showDeleteModal = false; }

  confirmDelete() {
    this.profileService.deleteUser(this.idUser!).subscribe({
      next: () => {
        this.toast.success("Conta apagada");
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

}
