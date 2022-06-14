import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosTurmaComponent } from './cursos-turma.component';

describe('CursosTurmaComponent', () => {
  let component: CursosTurmaComponent;
  let fixture: ComponentFixture<CursosTurmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CursosTurmaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CursosTurmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
