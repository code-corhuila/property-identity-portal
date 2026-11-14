import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { asApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { ROLE_LABEL, UserSummary } from '../model/identity';
import { FORM_STYLES } from './form.styles';

/**
 * Profile (/perfil, HU-IDENT-003): name, e-mail and role from GET /users/me (navigation-map.md).
 * "Convertirme en anfitrión" only for a GUEST. "Cerrar sesión" (POST /logout) is in the frame of
 * the container, which owns the session.
 */
@Component({
  selector: 'app-profile-page',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="profile-title">
      <h1 id="profile-title">Perfil</h1>
      @if (error(); as message) {
        <p role="alert">{{ message }}</p>
        <button type="button" (click)="load()">Reintentar</button>
      } @else if (user(); as u) {
        <dl>
          <dt>Nombre</dt><dd>{{ u.name || '—' }}</dd>
          <dt>Correo</dt><dd>{{ u.email }}</dd>
          <dt>Rol</dt><dd>{{ role(u) }}</dd>
        </dl>
        @if (u.roles.includes('GUEST')) {
          <a class="action" routerLink="convertirme-en-anfitrion">Convertirme en anfitrión</a>
        }
        <a routerLink="/perfil/notificaciones">Notificaciones</a>
      } @else {
        <p aria-busy="true">Cargando…</p>
      }
    </section>
  `,
  styles: [FORM_STYLES, `
    dl { display: grid; grid-template-columns: auto 1fr; gap: var(--space-2) var(--space-4); margin: 0; }
    dt { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
    dd { margin: 0; }
    .action { font-weight: var(--font-weight-medium); }
  `],
})
export class ProfilePageComponent {
  private readonly api = inject(IdentityApiService);
  readonly user = signal<UserSummary | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.error.set(null);
    this.api.me().subscribe({
      next: (u) => this.user.set(u),
      error: (err: unknown) => this.error.set(asApiError(err).userMessage),
    });
  }

  role(u: UserSummary): string {
    return ROLE_LABEL[u.roles[0]] ?? u.roles[0];
  }
}
