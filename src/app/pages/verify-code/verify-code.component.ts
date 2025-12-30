import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-verify-code',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './verify-code.component.html',
    styleUrls: ['./verify-code.component.scss']
})
export class VerifyCodeComponent implements OnInit, OnDestroy {

    email: string = '';
    otpCode: string = '';
    isLoading = false;

    // Timer logic
    timeLeft: number = 300; // 5 minutes in seconds
    interval: any;
    displayTime: string = "05:00";

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private loginService: LoginService,
        private toastService: ToastrService
    ) { }

    ngOnInit(): void {
        this.email = this.route.snapshot.queryParams['email'];
        const isInitial = this.route.snapshot.queryParams['initial'] === 'true';

        if (!this.email) {
            this.toastService.error("Email não encontrado. Tente se cadastrar novamente.");
            this.router.navigate(['/signup']);
            return;
        }

        this.startTimer(isInitial);
    }

    ngOnDestroy(): void {
        this.stopTimer();
    }

    startTimer(restart: boolean = false) {
        this.stopTimer();

        const storageKey = `verify_expiry_${this.email}`;
        const now = Math.floor(Date.now() / 1000);

        if (restart) {
            // Reiniciar: define novo tempo (5 min) e salva
            const expirationTime = now + 300;
            localStorage.setItem(storageKey, expirationTime.toString());
            this.timeLeft = 300;
        } else {
            // Verificar se já existe tempo salvo
            const savedExpiration = localStorage.getItem(storageKey);

            if (savedExpiration) {
                const expirationTime = parseInt(savedExpiration, 10);
                this.timeLeft = expirationTime - now;
            } else {
                // Primeira vez (ou sem storage): define 5 min
                const expirationTime = now + 300;
                localStorage.setItem(storageKey, expirationTime.toString());
                this.timeLeft = 300;
            }
        }

        // Se o tempo já passou
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.updateDisplayTime();
            return;
        }

        this.updateDisplayTime();

        this.interval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplayTime();
            } else {
                this.stopTimer();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    updateDisplayTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.displayTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }

    padZero(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }

    onlyNumbers(event: any) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    verify() {
        if (this.otpCode.length < 6) return;

        this.isLoading = true;
        this.loginService.verifyCode(this.email, this.otpCode).subscribe({
            next: (msg) => {
                this.toastService.success("Conta verificada com sucesso!");
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading = false;
                console.error("Erro na verificação:", err); // Log completo para debug

                if (err.status === 403) {
                    this.toastService.error("Acesso negado (403). Verifique o SecurityConfig no backend.");
                    return;
                }

                const msg = err.error || "Código inválido ou expirado.";

                try {
                    const parsed = JSON.parse(msg);
                    this.toastService.error(parsed.message || "Erro na verificação.");
                } catch {
                    this.toastService.error(msg);
                }
            }
        });
    }

    resend() {
        this.isLoading = true;
        this.loginService.resendCode(this.email).subscribe({
            next: (msg) => {
                this.isLoading = false;
                this.toastService.info("Novo código enviado para seu e-mail.");
                this.otpCode = ''; // Limpa o campo
                this.startTimer(true); // Reinicia o timer
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error("Erro ao reenviar código. Tente novamente.");
            }
        });
    }
}
