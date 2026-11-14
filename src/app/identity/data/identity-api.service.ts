import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SignedIn, UserSummary } from '../model/identity';

/**
 * Typed calls to Identity through the gateway. The injected HttpClient is the CONTAINER's: its
 * interceptor completes the URL, keeps the session and normalises every error.
 */
@Injectable({ providedIn: 'root' })
export class IdentityApiService {
  private readonly http = inject(HttpClient);

  /** E-11. */
  login(email: string, password: string): Observable<SignedIn> {
    return this.http.post<SignedIn>('/api/v1/login', { email, password });
  }

  /** E-10. The same key while the person retries the same form, so one account is created. */
  register(name: string, email: string, password: string, idempotencyKey: string): Observable<SignedIn> {
    return this.http.post<SignedIn>('/api/v1/register', { name, email, password },
      { headers: { 'Idempotency-Key': idempotencyKey } });
  }

  /** E-25: the account of the session (the profile). */
  me(): Observable<UserSummary> {
    return this.http.get<UserSummary>('/api/v1/users/me');
  }

  /** E-14: GUEST becomes HOST; the container renews the session so the next token carries it. */
  upgradeToHost(): Observable<UserSummary> {
    return this.http.post<UserSummary>('/api/v1/users/me/upgrade-to-host', {});
  }
}
