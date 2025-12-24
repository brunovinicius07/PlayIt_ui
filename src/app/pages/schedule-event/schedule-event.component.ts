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
    opening: '19:00',
    closure: '22:00',
    description: ''
  };

  // 🔥 Novo Seletor de Hora Premium
  showTimePicker = false;
  pickingField: 'opening' | 'closure' = 'opening';
  tempHour = '19';
  tempMinute = '00';

  hoursList: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutesList: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Listas repetidas para o efeito de loop infinito
  loopedHours: string[] = [...this.hoursList, ...this.hoursList, ...this.hoursList];
  loopedMinutes: string[] = [...this.minutesList, ...this.minutesList, ...this.minutesList];

  // Drag variables for desktop
  private isDragging = false;
  private startY = 0;
  private startScrollTop = 0;

  constructor(private scheduleService: ScheduleEventService) { }

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
    this.showTimePicker = false;
  }

  /* ================= CUSTOM TIME PICKER ================= */

  openTimePicker(field: 'opening' | 'closure') {
    this.pickingField = field;
    const currentVal = this.newEvent[field];

    if (currentVal) {
      const parts = currentVal.split(':');
      this.tempHour = parts[0].padStart(2, '0');
      this.tempMinute = parts[1].padStart(2, '0');
    } else {
      // Default positions if blank
      this.tempHour = field === 'opening' ? '19' : '22';
      this.tempMinute = '00';
    }

    this.showTimePicker = true;

    // Sincroniza o scroll inicial
    setTimeout(() => {
      this.syncScrolls();
    }, 50);
  }

  // Sincroniza o scroll das listas com os valores de tempHour/tempMinute
  private syncScrolls() {
    const lists = document.querySelectorAll('.scroll-list');

    // Altura de cada item: 50px. Centro do container: 110px. 
    // Offset para centralizar: 110 - 25 = 85px.

    // Hora (posicionamos na cópia do meio para permitir scroll infinito)
    const hIdx = this.hoursList.indexOf(this.tempHour);
    if (hIdx !== -1 && lists[0]) {
      lists[0].scrollTop = (hIdx + 24) * 50 - 85;
    }

    // Minuto
    const mIdx = this.minutesList.indexOf(this.tempMinute);
    if (mIdx !== -1 && lists[1]) {
      lists[1].scrollTop = (mIdx + 60) * 50 - 85;
    }
  }

  selectHour(h: string) {
    this.tempHour = h;
    this.syncScrolls();
  }

  selectMinute(m: string) {
    this.tempMinute = m;
    this.syncScrolls();
  }

  confirmTime() {
    this.newEvent[this.pickingField] = `${this.tempHour}:${this.tempMinute}`;
    this.showTimePicker = false;
  }

  closeTimePicker() {
    this.showTimePicker = false;
  }

  onScroll(event: any, type: 'hour' | 'minute') {
    const el = event.target;
    const itemHeight = 50;
    const listCount = type === 'hour' ? 24 : 60;

    // 1. Lógica de Pulo Infinito
    // Se sair muito do segmento central, reposiciona sem o usuário ver
    if (el.scrollTop < itemHeight * (listCount - 5)) {
      el.scrollTop += itemHeight * listCount;
    } else if (el.scrollTop > itemHeight * (listCount * 2 - 5)) {
      el.scrollTop -= itemHeight * listCount;
    }

    // 2. Cálculo do item selecionado (offset 85 para pegar o centro)
    const itemIndexRaw = Math.round((el.scrollTop + 85) / itemHeight);
    const val = (type === 'hour' ? this.loopedHours : this.loopedMinutes)[itemIndexRaw];

    if (type === 'hour') {
      if (val && val !== this.tempHour) this.tempHour = val;
    } else {
      if (val && val !== this.tempMinute) this.tempMinute = val;
    }
  }

  /* ================= DESKTOP OPTIMIZATIONS ================= */

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    const direction = event.deltaY > 0 ? 1 : -1;
    const itemHeight = 50;

    // Move exatamente um item por tick do scroll
    el.scrollBy({
      top: direction * itemHeight,
      behavior: 'smooth'
    });
  }

  // Permite arrastar com o mouse no desktop
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    const el = event.currentTarget as HTMLElement;
    this.startY = event.pageY - el.offsetTop;
    this.startScrollTop = el.scrollTop;
    el.style.cursor = 'grabbing';
    el.style.scrollSnapType = 'none'; // Desativa snap durante o arraste para fluidez
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    const y = event.pageY - el.offsetTop;
    const walk = (y - this.startY) * 1.5; // Multiplicador de velocidade
    el.scrollTop = this.startScrollTop - walk;
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const el = event.currentTarget as HTMLElement;
    el.style.cursor = 'pointer';
    el.style.scrollSnapType = 'y mandatory'; // Reativa snap para travar no lugar certo
  }

  onMouseLeave(event: MouseEvent) {
    this.onMouseUp(event);
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
