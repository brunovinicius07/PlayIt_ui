import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-event.component.html',
  styleUrls: ['./schedule-event.component.scss']
})
export class ScheduleEventComponent {

  constructor(private router: Router) {}

  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();

  monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  get currentMonthName() {
    return this.monthNames[this.currentMonth];
  }

  weeks: any[] = [];
  selectedDate: Date | null = null;

  ngOnInit(): void {
    this.buildCalendar(this.currentMonth, this.currentYear);
  }

  buildCalendar(month: number, year: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dayCounter = 1;
    const calendar = [];

    for (let week = 0; week < 6; week++) {
      const weekRow = [];

      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDay) || dayCounter > daysInMonth) {
          weekRow.push(null);
        } else {
          weekRow.push(new Date(year, month, dayCounter));
          dayCounter++;
        }
      }
      calendar.push(weekRow);
    }

    this.weeks = calendar;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar(this.currentMonth, this.currentYear);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar(this.currentMonth, this.currentYear);
  }

  selectDay(day: Date) {
    this.selectedDate = day;
    console.log("Dia selecionado:", day);
  }

  goToAgenda() {
    this.router.navigate(['/agenda']);
  }
}
