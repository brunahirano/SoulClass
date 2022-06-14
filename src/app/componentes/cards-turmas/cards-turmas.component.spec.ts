import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsTurmasComponent } from './cards-turmas.component';

describe('CardsTurmasComponent', () => {
  let component: CardsTurmasComponent;
  let fixture: ComponentFixture<CardsTurmasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsTurmasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardsTurmasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
