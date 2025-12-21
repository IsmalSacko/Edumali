import { TestBed } from '@angular/core/testing';

import { EnseignantServiceList } from './ensignant-service-list';

describe('EnseignantServiceList', () => {
  let service: EnseignantServiceList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnseignantServiceList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
