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
  showCreateModal = false;

  selectedDate: Date | null = null;
  eventsOfDay: any[] = [];

  editingEventId: string | null = null;
  openEventMenuIndex: number | null = null;

  // 🔔 Toast de erro da API
  apiErrorMessage: string | null = null;

  // 🔥 Modal de exclusão
  deleteEventModalOpen = false;
  eventToDelete: any = null;

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

  /* ================= CALENDÁRIO ================= */

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
        next: days => this.daysWithEvents = days.map(d => Number(d)),
        error: () => this.daysWithEvents = []
      });
  }

  /* ================= EVENTOS ================= */

  selectDay(day: Date) {
    this.selectedDate = day;
    this.showDayModal = true;
    this.openEventMenuIndex = null;

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

  toggleEventMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.openEventMenuIndex =
      this.openEventMenuIndex === index ? null : index;
  }

  /* ================= CREATE / EDIT ================= */

  openCreateEvent() {
    this.resetForm();
    this.apiErrorMessage = null;
    this.editingEventId = null;
    this.showCreateModal = true;
  }

  editEvent(event: any, e: MouseEvent) {
    e.stopPropagation();
    this.openEventMenuIndex = null;

    this.editingEventId = event.id;
    this.apiErrorMessage = null;

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
    this.apiErrorMessage = null;
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

    const request$ = this.editingEventId
      ? this.scheduleService.updateEvent(this.editingEventId, payload)
      : this.scheduleService.createEvent(payload);

    request$.subscribe({
      next: () => this.finishSave(),
      error: err => this.handleApiError(err)
    });
  }

  private finishSave() {
    this.closeCreateModal();
    this.selectDay(this.selectedDate!);
    this.loadDaysWithEvents();
  }

  /* ================= DELETE (COM CONFIRMAÇÃO) ================= */

  openDeleteEventModal(event: any, e?: MouseEvent) {
    e?.stopPropagation();
    this.eventToDelete = event;
    this.deleteEventModalOpen = true;
    this.openEventMenuIndex = null;
  }

  closeDeleteEventModal() {
    this.deleteEventModalOpen = false;
    this.eventToDelete = null;
  }

  confirmDeleteEvent() {
    if (!this.eventToDelete) return;

    this.scheduleService.deleteEvent(this.eventToDelete.id).subscribe(() => {

      this.eventsOfDay = this.eventsOfDay.filter(
        ev => ev.id !== this.eventToDelete.id
      );

      if (this.selectedDate && this.eventsOfDay.length === 0) {
        const dayNumber = this.selectedDate.getDate();
        this.daysWithEvents = this.daysWithEvents.filter(d => d !== dayNumber);
      }

      this.closeDeleteEventModal();
    });
  }

  /* ================= ERROS ================= */

  handleApiError(error: any) {
    if (error?.status === 409 && error.error?.message) {
      this.apiErrorMessage = error.error.message;
      this.autoClearError();
      return;
    }

    this.apiErrorMessage = 'Erro inesperado ao salvar o evento.';
    this.autoClearError();
  }

  private autoClearError() {
    setTimeout(() => {
      this.apiErrorMessage = null;
    }, 4000);
  }

  /* ================= UTILS ================= */

  resetForm() {
    this.newEvent = {
      title: '',
      opening: '',
      closure: '',
      description: ''
    };
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;

    const today = new Date();

    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  }
}
