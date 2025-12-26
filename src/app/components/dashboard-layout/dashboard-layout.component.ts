import { Component, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {

  sidebarCollapsed = false;
  isMobile = false;
  mobileMenuOpen = false;
  darkMode = false;

  userName = localStorage.getItem('username') || '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.darkMode = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle("dark-mode", this.darkMode);

    this.applyResponsiveSidebar();

    this.dashboardService.getLoggedUser().subscribe({
      next: (user) => {
        this.userName = user.nameUser;
      },
      error: () => {
        console.warn('Erro ao carregar usuário');
      }
    });

    window.addEventListener("resize", () => {
      this.applyResponsiveSidebar();
      this.cdr.detectChanges();
    });
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  applyResponsiveSidebar() {
    this.isMobile = window.innerWidth <= 938;

    if (this.isMobile) {
      this.sidebarCollapsed = false;
      this.mobileMenuOpen = false;
    }
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;

    if (this.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("theme", this.darkMode ? "dark" : "light");
  }

  logout() {
    document.body.classList.remove("dark-mode");
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onMenuClick() {
    if (this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  // FECHAR AO CLICAR FORA (SEM OFUSCAR A TELA)
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isMobile && this.mobileMenuOpen) {
      const sidebar = this.el.nativeElement.querySelector('.sidebar');
      const toggleBtns = this.el.nativeElement.querySelectorAll('.toggle-line-btn');

      let clickedToggle = false;
      toggleBtns.forEach((btn: any) => {
        if (btn.contains(event.target)) clickedToggle = true;
      });

      if (sidebar && !sidebar.contains(event.target) && !clickedToggle) {
        this.mobileMenuOpen = false;
        this.cdr.detectChanges();
      }
    }
  }
  isMusicActive(): boolean {
    return this.router.url.startsWith('/music') || this.router.url.startsWith('/library');
  }
}
