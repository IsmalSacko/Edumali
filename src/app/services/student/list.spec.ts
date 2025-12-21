import { TestBed } from '@angular/core/testing';

import { StudentServiceList } from './student-service-list';

describe('StudentServiceList', () => {
  let service: StudentServiceList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentServiceList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
