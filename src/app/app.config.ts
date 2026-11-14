import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LOGIN_ROUTES, ONBOARDING_ROUTES, PROFILE_ROUTES, REGISTER_ROUTES } from './identity/identity.routes';

/**
 * Standalone runs only, on the container's mount points. Deliberately NO
 * provideHttpClient(): inside the container the portal uses the container's client.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter([
    { path: 'auth/login', children: LOGIN_ROUTES },
    { path: 'auth/register', children: REGISTER_ROUTES },
    { path: 'auth/onboarding', children: ONBOARDING_ROUTES },
    { path: 'perfil', children: PROFILE_ROUTES },
    { path: '**', redirectTo: 'auth/login' },
  ])],
};
