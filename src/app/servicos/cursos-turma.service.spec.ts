import { TestBed } from '@angular/core/testing';

import { CursosTurmaService } from './cursos-turma.service';

describe('CursosTurmaService', () => {
  let service: CursosTurmaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CursosTurmaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
