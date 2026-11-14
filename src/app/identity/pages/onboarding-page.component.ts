import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { asApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { FORM_STYLES } from './form.styles';

/** Onboarding (/auth/onboarding): "Quiero reservar" or "Quiero ser anfitrión" (HU-IDENT-003). */
@Component({
  selector: 'app-onboarding-page',
  template: `
    <section aria-labelledby="onboarding-title">
      <h1 id="onboarding-title">Bienvenido a Property</h1>
      @if (error(); as message) { <p role="alert">{{ message }}</p> }
      <button type="button" (click)="book()" [disabled]="sending()">Quiero reservar</button>
      <button type="button" (click)="host()" [disabled]="sending()">Quiero ser anfitrión</button>
    </section>
  `,
  styles: FORM_STYLES,
})
export class OnboardingPageComponent {
  private readonly api = inject(IdentityApiService);
  private readonly router = inject(Router);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);

  book(): void {
    void this.router.navigateByUrl('/explorar');
  }

  /** Managing properties is out of scope in MVP 1: the account becomes HOST and goes on exploring. */
  host(): void {
    this.sending.set(true);
    this.error.set(null);
    this.api.upgradeToHost().subscribe({
      next: () => this.book(),
      error: (err: unknown) => {
        this.sending.set(false);
        const e = asApiError(err);
        this.error.set(e.status === 422 ? 'Tu cuenta ya es de anfitrión.' : e.userMessage);
      },
    });
  }
}
