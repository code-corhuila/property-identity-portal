import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { ApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { LOGIN_ROUTES, ONBOARDING_ROUTES, REGISTER_ROUTES } from '../identity.routes';

const failure = (status: number, userMessage: string): ApiError =>
  ({ status, code: 'X', message: 'x', details: [], traceId: 't', userMessage });

describe('the auth screens', () => {
  let calls: { op: string; args: unknown[]; answer: Subject<unknown> }[];
  let harness: RouterTestingHarness;

  const call = (op: string) => (...args: unknown[]) => {
    const answer = new Subject<unknown>();
    calls.push({ op, args, answer });
    return answer;
  };

  async function open(url: string): Promise<void> {
    calls = [];
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'auth/login', children: LOGIN_ROUTES },
          { path: 'auth/register', children: REGISTER_ROUTES },
          { path: 'auth/onboarding', children: ONBOARDING_ROUTES },
          { path: '**', children: [] },
        ], withComponentInputBinding()),   // as the container provides it
        { provide: IdentityApiService, useValue: { login: call('login'), register: call('register'), upgradeToHost: call('host') } },
      ],
    });
    harness = await RouterTestingHarness.create(url);
  }

  const el = () => harness.routeNativeElement!;
  const type = (id: string, value: string) => {
    const input = el().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  async function press(selector = 'button[type=submit]'): Promise<void> {
    el().querySelector<HTMLButtonElement>(selector)!.click();
    await harness.fixture.whenStable();
  }
  const url = () => TestBed.inject(Router).url;
  const alert = () => el().querySelector('[role=alert]')?.textContent?.trim();

  it('logs in and goes back to where the expired session was', async () => {
    await open('/auth/login?returnUrl=%2Freservas&expired=true');
    expect(alert()).toBe('Tu sesión expiró. Inicia sesión de nuevo.');
    type('email', 'ana@example.com');
    type('password', 'SecurePass123');
    await press();
    expect(calls[0].args).toEqual(['ana@example.com', 'SecurePass123']);
    calls[0].answer.next({ user: { id: 'u', email: 'ana@example.com', roles: ['GUEST'] } });
    await harness.fixture.whenStable();
    expect(url()).toBe('/reservas');
  });

  it('shows the message of the container on a wrong credential and never leaves the app', async () => {
    await open('/auth/login?returnUrl=https:%2F%2Fevil.example');
    type('email', 'ana@example.com');
    type('password', 'wrong');
    await press();
    calls[0].answer.error(failure(401, 'Correo o contraseña incorrectos'));
    await harness.fixture.whenStable();
    expect(alert()).toBe('Correo o contraseña incorrectos');
    await press();
    calls[1].answer.next({ user: { id: 'u', email: 'ana@example.com', roles: ['GUEST'] } });
    await harness.fixture.whenStable();
    expect(url()).toBe('/explorar');
  });

  it('registers with the rules of E-10, keeps its key on a retry and goes to the onboarding', async () => {
    await open('/auth/register');
    await press();
    expect(calls).toHaveLength(0);
    expect(el().querySelectorAll('.field-error')).toHaveLength(3);
    type('name', 'Ana Pérez');
    type('email', 'ana@example.com');
    type('password', 'SecurePass123');
    await press();
    calls[0].answer.error(failure(422, 'x'));
    await harness.fixture.whenStable();
    expect(alert()).toBe('Ya existe una cuenta con ese correo. Inicia sesión.');
    await press();
    expect(calls[1].args[3]).toBe(calls[0].args[3]);
    calls[1].answer.next({ user: { id: 'u', email: 'ana@example.com', roles: ['GUEST'] } });
    await harness.fixture.whenStable();
    expect(url()).toBe('/auth/onboarding');
  });

  it('onboarding: book goes to explore; host upgrades the account first', async () => {
    await open('/auth/onboarding');
    const [book, host] = Array.from(el().querySelectorAll('button'));
    host.click();
    await harness.fixture.whenStable();
    expect(calls[0].op).toBe('host');
    calls[0].answer.error(failure(422, 'x'));
    await harness.fixture.whenStable();
    expect(alert()).toBe('Tu cuenta ya es de anfitrión.');
    book.click();
    await harness.fixture.whenStable();
    expect(url()).toBe('/explorar');
  });
});
