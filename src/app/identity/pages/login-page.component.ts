import { booleanAttribute, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { asApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { FORM_STYLES } from './form.styles';

/** Login (/auth/login, HU-IDENT-002): "Bienvenido de nuevo", correo y contraseña (navigation-map.md). */
@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" aria-labelledby="login-title" novalidate>
      <h1 id="login-title">Bienvenido de nuevo</h1>
      @if (expired() && !error()) { <p role="alert">Tu sesión expiró. Inicia sesión de nuevo.</p> }
      @if (error(); as message) { <p role="alert">{{ message }}</p> }
      <label for="email">Correo</label>
      <input id="email" type="email" autocomplete="email" formControlName="email" />
      <label for="password">Contraseña</label>
      <input id="password" type="password" autocomplete="current-password" formControlName="password" />
      <button type="submit" [disabled]="sending()">Iniciar sesión</button>
      <p>¿No tienes cuenta? <a routerLink="/auth/register">Crea tu cuenta</a></p>
    </form>
  `,
  styles: FORM_STYLES,
})
export class LoginPageComponent {
  // From the query string the container sets when a session expired.
  readonly returnUrl = input<string | undefined>();
  readonly expired = input(false, { transform: booleanAttribute });
  private readonly api = inject(IdentityApiService);
  private readonly router = inject(Router);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.sending()) return;
    const { email, password } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    this.api.login(email.trim(), password).subscribe({
      // Only paths inside this application: an absolute URL never leaves it.
      next: () => void this.router.navigateByUrl(this.returnUrl()?.startsWith('/') ? this.returnUrl()! : '/explorar'),
      error: (err: unknown) => {
        this.sending.set(false);
        this.error.set(asApiError(err).userMessage);   // a 401 reads "Correo o contraseña incorrectos"
      },
    });
  }
}
