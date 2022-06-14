import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConteudoTurmaComponent } from './conteudo-turma.component';

describe('ConteudoTurmaComponent', () => {
  let component: ConteudoTurmaComponent;
  let fixture: ComponentFixture<ConteudoTurmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConteudoTurmaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConteudoTurmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
