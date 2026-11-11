import { LOGIN_ROUTES, ONBOARDING_ROUTES, REGISTER_ROUTES } from './identity.routes';

describe('identity routes', () => {
  it('exposes one screen on each mount point of the container', () => {
    for (const routes of [LOGIN_ROUTES, REGISTER_ROUTES, ONBOARDING_ROUTES]) {
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('');
      expect(routes[0].component).toBeDefined();
    }
  });
});
