import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleEventComponentTsComponent } from './schedule-event.component';

describe('ScheduleEventComponentTsComponent', () => {
  let component: ScheduleEventComponentTsComponent;
  let fixture: ComponentFixture<ScheduleEventComponentTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleEventComponentTsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleEventComponentTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
