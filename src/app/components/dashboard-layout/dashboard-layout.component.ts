import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {

  sidebarCollapsed = false;
  darkMode = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.cdr.detectChanges();
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

  // Responsividade automática
  applyResponsiveSidebar() {
    this.sidebarCollapsed = window.innerWidth <= 938;
  }

  ngOnInit() {
    this.darkMode = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle("dark-mode", this.darkMode);

    this.applyResponsiveSidebar();

    window.addEventListener("resize", () => {
      this.applyResponsiveSidebar();
      this.cdr.detectChanges();
    });
  }
}
