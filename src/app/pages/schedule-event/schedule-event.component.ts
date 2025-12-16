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

  readonly userId = 1;

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

  showDayModal = false;
  selectedDate: Date | null = null;
  eventsOfDay: any[] = [];

  showCreateModal = false;
  editingEventId: string | null = null;

  openEventMenuIndex: number | null = null;

  newEvent = {
    title: '',
    opening: '',
    closure: '',
    description: ''
  };

  constructor(private scheduleService: ScheduleEventService) {}

  ngOnInit(): void {
    this.buildCalendar(this.currentMonth, this.currentYear);
    this.loadDaysWithEvents();
  }

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

  loadDaysWithEvents() {
    this.scheduleService
      .getDaysWithEvents(this.userId, this.currentYear, this.currentMonth + 1)
      .subscribe({
        next: days => {
          this.daysWithEvents = days.map(d => Number(d));
        },
        error: () => this.daysWithEvents = []
      });
  }

  selectDay(day: Date) {
    this.selectedDate = day;
    this.showDayModal = true;

    const formatted = this.formatDateLocal(day);

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
    this.openEventMenuIndex = null;
  }

  openCreateEvent() {
    this.resetForm();
    this.editingEventId = null;
    this.showCreateModal = true;
  }

  editEvent(event: any, e: MouseEvent) {
    e.stopPropagation();
    this.openEventMenuIndex = null;

    this.editingEventId = event.id;

    this.newEvent = {
      title: event.title,
      opening: event.opening.slice(11, 16),
      closure: event.closure.slice(11, 16),
      description: event.description
    };

    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.editingEventId = null;
    this.resetForm();
  }

  saveEvent() {
    if (!this.selectedDate) return;

    const day = this.formatDateLocal(this.selectedDate);

    const payload = {
      userId: this.userId,
      day,
      opening: `${day}T${this.newEvent.opening}:00`,
      closure: `${day}T${this.newEvent.closure}:00`,
      title: this.newEvent.title,
      description: this.newEvent.description
    };

    // 🔥 EDIT
    if (this.editingEventId) {
      this.scheduleService
        .updateEvent(this.editingEventId, payload)
        .subscribe(() => this.finishSave());
    }
    // 🔥 CREATE
    else {
      this.scheduleService
        .createEvent(payload)
        .subscribe(() => this.finishSave());
    }
  }

  private finishSave() {
    this.closeCreateModal();
    this.selectDay(this.selectedDate!);
    this.loadDaysWithEvents();
  }

  resetForm() {
    this.newEvent = {
      title: '',
      opening: '',
      closure: '',
      description: ''
    };
  }

  deleteEvent(event: any, e: MouseEvent) {
    e.stopPropagation();
    this.openEventMenuIndex = null;

    this.scheduleService.deleteEvent(event.id).subscribe(() => {

      this.eventsOfDay = this.eventsOfDay.filter(ev => ev.id !== event.id);

      this.loadDaysWithEvents();
    });
  }


  toggleEventMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.openEventMenuIndex =
      this.openEventMenuIndex === index ? null : index;
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
