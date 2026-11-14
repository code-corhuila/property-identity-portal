import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { BecomeHostPageComponent } from './pages/become-host-page.component';
import { OnboardingPageComponent } from './pages/onboarding-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { RegisterPageComponent } from './pages/register-page.component';

/** Exposed to the container as './routes' (navigation-map.md, "Portals"). Mounted on /auth/login. */
export const LOGIN_ROUTES: Routes = [{ path: '', title: 'Iniciar sesión', component: LoginPageComponent }];

/** Mounted on /auth/register. */
export const REGISTER_ROUTES: Routes = [{ path: '', title: 'Crea tu cuenta', component: RegisterPageComponent }];

/** Mounted on /auth/onboarding (signed in). */
export const ONBOARDING_ROUTES: Routes = [{ path: '', title: 'Bienvenido a Property', component: OnboardingPageComponent }];

/** Mounted on /perfil (signed in): the profile, and becoming a host (HU-IDENT-003). */
export const PROFILE_ROUTES: Routes = [
  { path: '', title: 'Perfil', component: ProfilePageComponent },
  { path: 'convertirme-en-anfitrion', title: 'Convertirme en anfitrión', component: BecomeHostPageComponent },
];
