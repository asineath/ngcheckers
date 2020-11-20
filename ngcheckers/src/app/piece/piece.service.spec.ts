import { TestBed } from '@angular/core/testing';

import { PieceService } from './piece.service';

describe('PieceService', () => {
  let service: PieceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
