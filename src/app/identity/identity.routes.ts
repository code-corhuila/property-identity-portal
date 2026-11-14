import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { OnboardingPageComponent } from './pages/onboarding-page.component';
import { RegisterPageComponent } from './pages/register-page.component';

/** Exposed to the container as './routes' (navigation-map.md, "Portals"). Mounted on /auth/login. */
export const LOGIN_ROUTES: Routes = [{ path: '', title: 'Iniciar sesión', component: LoginPageComponent }];

/** Mounted on /auth/register. */
export const REGISTER_ROUTES: Routes = [{ path: '', title: 'Crea tu cuenta', component: RegisterPageComponent }];

/** Mounted on /auth/onboarding (signed in). */
export const ONBOARDING_ROUTES: Routes = [{ path: '', title: 'Bienvenido a Property', component: OnboardingPageComponent }];
