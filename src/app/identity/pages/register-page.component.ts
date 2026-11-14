import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { asApiError } from '../../shell-contract';
import { IdentityApiService } from '../data/identity-api.service';
import { PASSWORD_PATTERN } from '../model/identity';
import { FORM_STYLES } from './form.styles';

/** Register (/auth/register, HU-IDENT-001): "Crea tu cuenta", then the onboarding. */
@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" aria-labelledby="register-title" novalidate>
      <h1 id="register-title">Crea tu cuenta</h1>
      @if (error(); as message) { <p role="alert">{{ message }}</p> }
      <label for="name">Nombre completo</label>
      <input id="name" type="text" autocomplete="name" formControlName="name" />
      @if (shown('name')) { <span class="field-error">Escribe tu nombre (máximo 100 caracteres)</span> }
      <label for="email">Correo</label>
      <input id="email" type="email" autocomplete="email" formControlName="email" />
      @if (shown('email')) { <span class="field-error">Escribe un correo válido</span> }
      <label for="password">Contraseña</label>
      <input id="password" type="password" autocomplete="new-password" formControlName="password" />
      @if (shown('password')) { <span class="field-error">Mínimo 8 caracteres, con una mayúscula y un número</span> }
      <button type="submit" [disabled]="sending()">Crear cuenta</button>
      <p>¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a></p>
    </form>
  `,
  styles: FORM_STYLES,
})
export class RegisterPageComponent {
  private readonly api = inject(IdentityApiService);
  private readonly router = inject(Router);
  // One key per form: a retry after a lost answer does not create a second account (E-10).
  private readonly key = crypto.randomUUID();
  readonly sending = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
  });

  shown(field: 'name' | 'email' | 'password'): boolean {
    return this.submitted() && this.form.controls[field].invalid;
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.sending()) return;
    const { name, email, password } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    this.api.register(name.trim(), email.trim(), password, this.key).subscribe({
      next: () => void this.router.navigateByUrl('/auth/onboarding'),
      error: (err: unknown) => {
        this.sending.set(false);
        const e = asApiError(err);
        this.error.set(e.status === 422 ? 'Ya existe una cuenta con ese correo. Inicia sesión.' : e.userMessage);
      },
    });
  }
}
