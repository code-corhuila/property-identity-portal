import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { ApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { PROFILE_ROUTES } from '../identity.routes';
import { UserSummary } from '../model/identity';

const guest: UserSummary = { id: 'u', email: 'ana@example.com', name: 'Ana Pérez', roles: ['GUEST'] };
const failure = (status: number, userMessage: string): ApiError =>
  ({ status, code: 'X', message: 'x', details: [], traceId: 't', userMessage });

describe('the profile screens', () => {
  let me: Subject<UserSummary>[];
  let upgrades: Subject<UserSummary>[];
  let harness: RouterTestingHarness;

  async function open(url: string): Promise<void> {
    me = [];
    upgrades = [];
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'perfil', children: PROFILE_ROUTES }, { path: '**', children: [] }]),
        { provide: IdentityApiService, useValue: {
          me: () => { const s = new Subject<UserSummary>(); me.push(s); return s; },
          upgradeToHost: () => { const s = new Subject<UserSummary>(); upgrades.push(s); return s; },
        } },
      ],
    });
    harness = await RouterTestingHarness.create(url);
  }

  const el = () => harness.routeNativeElement!;
  const text = () => el().textContent!.replace(/\s+/g, ' ');
  async function answer(s: Subject<UserSummary>, value: UserSummary | ApiError, ok = true): Promise<void> {
    if (ok) s.next(value as UserSummary);
    else s.error(value);
    await harness.fixture.whenStable();
  }

  it('shows the name, the e-mail and the role of GET /users/me, and offers becoming a host to a GUEST', async () => {
    await open('/perfil');
    await answer(me[0], guest);
    expect(text()).toContain('Ana Pérez');
    expect(text()).toContain('ana@example.com');
    expect(text()).toContain('Huésped');
    expect(el().querySelector('a.action')?.getAttribute('href')).toBe('/perfil/convertirme-en-anfitrion');
  });

  it('does not offer it to a HOST', async () => {
    await open('/perfil');
    await answer(me[0], { ...guest, roles: ['HOST'] });
    expect(text()).toContain('Anfitrión');
    expect(el().querySelector('a.action')).toBeNull();
  });

  it('shows the message of the container when GET /users/me fails', async () => {
    await open('/perfil');
    await answer(me[0], failure(503, 'El servicio no está disponible en este momento'), false);
    expect(el().querySelector('[role=alert]')?.textContent).toContain('no está disponible');
  });

  it('a GUEST becomes a HOST and goes back to the profile', async () => {
    await open('/perfil/convertirme-en-anfitrion');
    await answer(me[0], guest);
    el().querySelector('button')!.click();
    await harness.fixture.whenStable();
    expect(upgrades).toHaveLength(1);
    await answer(upgrades[0], { ...guest, roles: ['HOST'] });
    expect(TestBed.inject(Router).url).toBe('/perfil');
  });

  it('someone who is not a GUEST is told so and gets no button', async () => {
    await open('/perfil/convertirme-en-anfitrion');
    await answer(me[0], { ...guest, roles: ['ADMIN'] });
    expect(el().querySelector('[role=status]')?.textContent).toContain('ya es de anfitrión');
    expect(el().querySelector('button')).toBeNull();
  });

  it('an upgrade answered 422 (already upgraded meanwhile) says so too', async () => {
    await open('/perfil/convertirme-en-anfitrion');
    await answer(me[0], guest);
    el().querySelector('button')!.click();
    await harness.fixture.whenStable();
    await answer(upgrades[0], failure(422, 'x'), false);
    expect(el().querySelector('[role=status]')?.textContent).toContain('ya es de anfitrión');
  });
});
