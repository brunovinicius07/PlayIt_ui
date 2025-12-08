import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  userName = localStorage.getItem("username") || "Usuário";

  constructor(private router: Router) {}

  goToRepertoires() {
    this.router.navigate(['/repertoire']);
  }

  goToSchedule() {
    this.router.navigate(['/schedule']);
  }

}
