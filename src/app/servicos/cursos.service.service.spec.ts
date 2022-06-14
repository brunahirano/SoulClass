import { TestBed } from '@angular/core/testing';

import { Cursos.ServiceService } from './cursos.service.service';

describe('Cursos.ServiceService', () => {
  let service: Cursos.ServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cursos.ServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
