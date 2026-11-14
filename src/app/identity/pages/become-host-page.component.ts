import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { asApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { FORM_STYLES } from './form.styles';

/**
 * Become a host (/perfil/convertirme-en-anfitrion, HU-IDENT-003): only for a GUEST. POST
 * /users/me/upgrade-to-host (E-14); the container then renews the session, so the next token
 * carries HOST. Managing properties is out of scope in MVP 1 (scope.md).
 */
@Component({
  selector: 'app-become-host-page',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="host-title">
      <h1 id="host-title">Convertirme en anfitrión</h1>
      @if (state() === 'guest') {
        <p>Tu cuenta pasará a ser de anfitrión. Podrás seguir reservando como siempre.</p>
        @if (error(); as message) { <p role="alert">{{ message }}</p> }
        <button type="button" (click)="upgrade()" [disabled]="sending()">Convertirme en anfitrión</button>
      } @else if (state() === 'not-guest') {
        <p role="status">Tu cuenta ya es de anfitrión.</p>
      } @else if (state() === 'error') {
        <p role="alert">{{ error() }}</p>
      } @else {
        <p aria-busy="true">Cargando…</p>
      }
      <a routerLink="/perfil">Volver al perfil</a>
    </section>
  `,
  styles: FORM_STYLES,
})
export class BecomeHostPageComponent {
  private readonly api = inject(IdentityApiService);
  private readonly router = inject(Router);
  readonly state = signal<'loading' | 'guest' | 'not-guest' | 'error'>('loading');
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    // Only a GUEST may open it (navigation-map.md): anyone else is told and goes back.
    this.api.me().subscribe({
      next: (u) => this.state.set(u.roles.includes('GUEST') ? 'guest' : 'not-guest'),
      error: (err: unknown) => {
        this.error.set(asApiError(err).userMessage);
        this.state.set('error');
      },
    });
  }

  upgrade(): void {
    this.sending.set(true);
    this.error.set(null);
    this.api.upgradeToHost().subscribe({
      next: () => void this.router.navigateByUrl('/perfil'),
      error: (err: unknown) => {
        this.sending.set(false);
        const e = asApiError(err);
        if (e.status === 422) this.state.set('not-guest');   // upgraded meanwhile (E-14)
        else this.error.set(e.userMessage);
      },
    });
  }
}
