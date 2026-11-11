# property-identity-portal

> identity bounded context: web UI (remote)

Part of the **Property** distributed system — Grupo 2 · Angular 21 (zoneless) · Native Federation 21 · Node 22 or 24.
Documentation: [`property-docs`](https://github.com/code-corhuila/property-docs), `12-ux-ui/navigation-map.md`,
`design-system.md` and `07-api/authentication.md`.

## How the container mounts it

| Federation name | Local address | Exposed module | Exports |
|---|---|---|---|
| `identity` | `http://localhost:4204` | `./routes` → `src/app/identity/identity.routes.ts` | `LOGIN_ROUTES` (`/auth/login`), `REGISTER_ROUTES` (`/auth/register`), `ONBOARDING_ROUTES` (`/auth/onboarding`), `PROFILE_ROUTES` (`/perfil` and `/perfil/convertirme-en-anfitrion`) |

**This portal never calls `provideHttpClient()` and never touches a token.** Mounted in
`property-front`, it runs inside the container's injector and receives its client with the
interceptor (gateway URL, `X-Correlation-Id`, time limit, one error shape:
`src/app/shell-contract.ts`). The container keeps the session: it takes the tokens out of the
answers of `POST /login` and `POST /register` before they reach this portal
(`00-governance/security-policy.md`, "Client storage"; ADR-012).

`package.json` and `package-lock.json` hold the same versions as `property-front`: the
shared libraries are strict singletons, so a different Angular does not load.

## Install, build, test and run

```bash
npm ci          # installs exactly what package-lock.json records
npm run build   # dist/identity; also rewrites tsconfig.federation.json
npm test        # unit tests, one run (Vitest)
npm start       # http://localhost:4204/remoteEntry.json
```

Inside the container: run `npm start` here and in `property-front`, and open
`http://localhost:4200/auth/login`. `deploy/` builds the image (`npm ci`, then nginx) as the
service `identity-portal` on `platform`; `property-infra-postgres` publishes it on 4204.

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `property-docs`.
