/**
 * What this portal reads of identity-service.yaml. The container takes accessToken and
 * refreshToken out of AuthResponse before it reaches a portal (security-policy.md, "Client
 * storage"), so the portal only ever sees the account.
 */
export interface UserSummary {
  id: string;
  email: string;
  name?: string;
  roles: ('GUEST' | 'HOST' | 'ADMIN')[];
}

/** How a role reads on screen (the API values stay in English, security-policy.md). */
export const ROLE_LABEL: Record<UserSummary['roles'][number], string> = {
  GUEST: 'Huésped', HOST: 'Anfitrión', ADMIN: 'Administrador',
};

export interface SignedIn {
  user: UserSummary;
}

/** E-10: at least 8 characters, an uppercase letter and a digit; the name 1 to 100. */
export const PASSWORD_PATTERN = /^(?=.*\p{Lu})(?=.*\d).{8,100}$/u;
