import { TestBed } from '@angular/core/testing';

import { YtsApiService } from './yts-api.service';

describe('YtsApiService', () => {
  let service: YtsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YtsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
