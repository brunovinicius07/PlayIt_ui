import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleEventService } from '../../service/schedule-event.service';

@Component({
  selector: 'app-schedule-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-event.component.html',
  styleUrls: ['./schedule-event.component.scss']
})
export class ScheduleEventComponent implements OnInit {

  // ===== USER =====
  readonly userId = 1;

  // ===== CALENDAR =====
  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();

  weeks: (Date | null)[][] = [];
  daysWithEvents: number[] = [];

  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  get currentMonthName(): string {
    return this.monthNames[this.currentMonth];
  }

  // ===== DAY MODAL =====
  showDayModal = false;
  selectedDate: Date | null = null;
  eventsOfDay: any[] = [];

  // ===== CREATE MODAL =====
  showCreateModal = false;

  newEvent = {
    title: '',
    opening: '',
    closure: '',
    description: ''
  };

  constructor(private scheduleService: ScheduleEventService) {}

  // ===== INIT =====
  ngOnInit(): void {
    this.buildCalendar(this.currentMonth, this.currentYear);
    this.loadDaysWithEvents();
  }

  // ===== CALENDAR =====
  buildCalendar(month: number, year: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dayCounter = 1;
    const calendar: (Date | null)[][] = [];

    for (let w = 0; w < 6; w++) {
      const row: (Date | null)[] = [];

      for (let d = 0; d < 7; d++) {
        if ((w === 0 && d < firstDay) || dayCounter > daysInMonth) {
          row.push(null);
        } else {
          row.push(new Date(year, month, dayCounter));
          dayCounter++;
        }
      }

      calendar.push(row);
    }

    this.weeks = calendar;
  }

  prevMonth() {
    this.currentMonth === 0
      ? (this.currentMonth = 11, this.currentYear--)
      : this.currentMonth--;

    this.buildCalendar(this.currentMonth, this.currentYear);
    this.loadDaysWithEvents();
  }

  nextMonth() {
    this.currentMonth === 11
      ? (this.currentMonth = 0, this.currentYear++)
      : this.currentMonth++;

    this.buildCalendar(this.currentMonth, this.currentYear);
    this.loadDaysWithEvents();
  }

  // ===== API =====
  loadDaysWithEvents() {
    this.scheduleService
      .getDaysWithEvents(this.userId, this.currentYear, this.currentMonth + 1)
      .subscribe({
        next: days => this.daysWithEvents = days,
        error: () => this.daysWithEvents = []
      });
  }

  selectDay(day: Date) {
    this.selectedDate = day;
    this.showDayModal = true;

    const formatted = day.toISOString().split('T')[0];

    this.scheduleService
      .getEventsByDay(this.userId, formatted)
      .subscribe({
        next: events => this.eventsOfDay = events,
        error: () => this.eventsOfDay = []
      });
  }

  closeDayModal() {
    this.showDayModal = false;
    this.eventsOfDay = [];
  }

  // ===== CREATE EVENT =====
  openCreateEvent() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetForm();
  }

  saveEvent() {
    if (!this.selectedDate) return;

    const day = this.selectedDate.toISOString().split('T')[0];

    const payload = {
      userId: this.userId,
      day,
      opening: `${day}T${this.newEvent.opening}:00`,
      closure: `${day}T${this.newEvent.closure}:00`,
      title: this.newEvent.title,
      description: this.newEvent.description
    };

    this.scheduleService.createEvent(payload).subscribe({
      next: () => {
        this.closeCreateModal();
        this.selectDay(this.selectedDate!);
        this.loadDaysWithEvents();
      }
    });
  }

  resetForm() {
    this.newEvent = {
      title: '',
      opening: '',
      closure: '',
      description: ''
    };
  }
}
