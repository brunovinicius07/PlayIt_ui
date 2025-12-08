import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockmusicComponent } from './blockmusic.component';

describe('BlockmusicComponent', () => {
  let component: BlockmusicComponent;
  let fixture: ComponentFixture<BlockmusicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockmusicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockmusicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
