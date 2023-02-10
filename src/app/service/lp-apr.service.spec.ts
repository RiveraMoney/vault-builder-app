import { TestBed } from '@angular/core/testing';

import { LpAprService } from './lp-apr.service';

describe('LpAprService', () => {
  let service: LpAprService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LpAprService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
