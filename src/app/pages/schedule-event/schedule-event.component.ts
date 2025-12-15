import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScheduleEventService } from '../../service/schedule-event.service';

@Component({
  selector: 'app-schedule-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-event.component.html',
  styleUrls: ['./schedule-event.component.scss']
})
export class ScheduleEventComponent implements OnInit {

  constructor(
    private router: Router,
    private scheduleService: ScheduleEventService
  ) {}

  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();

  weeks: (Date | null)[][] = [];
  selectedDate: Date | null = null;

  eventsOfDay: any[] = [];
  daysWithEvents: number[] = [];

  showDayModal = false;

  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  get currentMonthName(): string {
    return this.monthNames[this.currentMonth];
  }

  ngOnInit(): void {
    this.buildCalendar(this.currentMonth, this.currentYear);
    this.loadDaysWithEvents();
  }

  buildCalendar(month: number, year: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dayCounter = 1;
    const calendar: (Date | null)[][] = [];

    for (let week = 0; week < 6; week++) {
      const weekRow: (Date | null)[] = [];

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
    this.loadDaysWithEvents();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }

    this.buildCalendar(this.currentMonth, this.currentYear);
    this.loadDaysWithEvents();
  }

  loadDaysWithEvents() {
    const userId = 1;

    this.scheduleService
      .getDaysWithEvents(userId, this.currentYear, this.currentMonth + 1)
      .subscribe({
        next: (days) => {
          this.daysWithEvents = days;
        },
        error: () => {
          this.daysWithEvents = [];
        }
      });
  }

  selectDay(day: Date) {
    this.selectedDate = day;

    const userId = 1;
    const formattedDay = day.toISOString().split('T')[0];

    this.scheduleService
      .getEventsByDay(userId, formattedDay)
      .subscribe(events => {
        this.eventsOfDay = events;
        this.showDayModal = true;
      });
  }

  closeDayModal() {
    this.showDayModal = false;
    this.eventsOfDay = [];
  }

  openCreateEvent() {
    console.log('Criar evento para:', this.selectedDate);
    // Próximo passo: abrir modal de criação
  }

  goToAgenda() {
    this.router.navigate(['/agenda']);
  }
}
