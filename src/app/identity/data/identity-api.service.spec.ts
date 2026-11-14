import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IdentityApiService } from './identity-api.service';

describe('IdentityApiService', () => {
  let api: IdentityApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    // A client only for the test: inside the container the portal gets the container's.
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(IdentityApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('logs in, registers with its Idempotency-Key and upgrades to host on the paths of the contract', () => {
    api.login('ana@example.com', 'SecurePass123').subscribe();
    const login = http.expectOne('/api/v1/login');
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ email: 'ana@example.com', password: 'SecurePass123' });

    api.register('Ana', 'ana@example.com', 'SecurePass123', 'key-1').subscribe();
    const register = http.expectOne('/api/v1/register');
    expect(register.request.headers.get('Idempotency-Key')).toBe('key-1');
    expect(register.request.body).toEqual({ name: 'Ana', email: 'ana@example.com', password: 'SecurePass123' });

    api.upgradeToHost().subscribe();
    expect(http.expectOne('/api/v1/users/me/upgrade-to-host').request.method).toBe('POST');
    http.verify();
  });
});
