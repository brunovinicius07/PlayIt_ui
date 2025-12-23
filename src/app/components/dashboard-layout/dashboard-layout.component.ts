import { Component, ChangeDetectorRef } from '@angular/core';
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
    private dashboardService: DashboardService
  ) {}

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
}
