## Authentication Architecture Specification

### Overview

Implements registration, login, Google OAuth, logout, password recovery, and account deletion using Supabase Auth within the TanStack Start app, integrating with existing oRPC, Drizzle schema, and UI patterns. Aligns with PRD items US-AUTH-001..005 and account deletion in 3.1, and preserves current catalog, moves, and user-move-statuses behaviors.

---

## 1) USER INTERFACE ARCHITECTURE

### Routes & Layout

- New routes (client + SSR guards where noted):
  - `routes/auth/sign-in.tsx` – Sign in form
  - `routes/auth/sign-up.tsx` – Registration form
  - `routes/auth/forgot-password.tsx` – Request reset email
  - `routes/auth/reset-password.tsx` – Handle Supabase redirect (deep link) to set new password
  - `routes/auth/oauth-callback.tsx` – OAuth callback handler (server/SSR exchanges `code` for session)
  - `routes/account.tsx` – Account settings (sign out, delete account with confirmation)
- Existing root layout (`routes/__root.tsx`) remains the app shell. Update `Nav` to render auth-aware items:
  - Signed-out: `Sign in`, `Sign up`
  - Signed-in: `My Moves` (existing/private), `Account`, `Sign out`
- Do not change public catalog routes behavior. Private pages (e.g., `My Moves` when added) will require SSR client context with auth state.
  - SEO/SSR alignment with PRD: public `catalog` and `moves.$slug` are SSR and indexable; private pages (e.g., `My Moves`) and `/admin` include `noindex`.

### UI Components (Shadcn + forms)

- New components under `src/components/auth/`:
  - `auth-form-wrapper.tsx` – Shared layout, title, description, and children slot. Handles global form error banner (aria-live polite) and success info.
  - `sign-in-form.tsx` – Email/password fields, submit button, "Continue with Google" button, link to `forgot-password`. Uses `@tanstack/react-form` with Zod schema and inline client-side validation.
  - `sign-up-form.tsx` – Email, password, confirm password. Shows password rules. Inline validation. Accepts optional `redirectTo`.
  - `forgot-password-form.tsx` – Email field, submits to server action to send reset email.
  - `reset-password-form.tsx` – New password + confirm; validates token presence from URL and submits server action.
- Reuse UI primitives from `src/components/ui`: `input`, `button`, `card`, `select` (not needed here), `textarea` (not needed), `badge` (for notices), `skeleton` (loading states).
- Accessibility:
  - All buttons include `type="button|submit"` explicitly.
  - Inputs use visible `<label>` with `htmlFor` and required a11y attributes.
  - Error messages associated via `aria-describedby` and id per field.
  - Form-level status via `role="status"` and `aria-live`.

### Responsibilities & Data Flow

- TanStack Start pages define SSR `loader`/`beforeLoad` for auth redirects:
  - Auth-only pages: redirect to `auth/sign-in` if not authenticated.
  - Guest-only pages: redirect to catalog if authenticated.
- Forms are client components responsible for:
  - Local state, client-side validation with Zod.
  - Calling dedicated oRPC mutations which delegate to server-side Supabase SDK or `fetch` to `api/auth` handlers.
  - Handling loading, success, and error states; disabling submit during pending.
- Navigation after success:
  - Sign up: redirect to catalog or email confirm notice depending on Supabase project email confirmation setting.
  - Sign in: redirect to last-visited (if stored) or catalog.
  - Forgot password: show success message; no redirect.
  - Reset password: show success then redirect to sign-in.
  - Google OAuth: clicking the button starts `auth.oauthStart` which returns a provider URL; browser redirects to Google → back to `routes/auth/oauth-callback.tsx` with `code`; server exchanges for a session and redirects to last-visited or catalog.

### Validation & Messages

- Sign up:
  - Email: required, valid format.
  - Password: required, 8–72 chars, at least 1 letter and 1 number; confirm must match.
  - Server errors:
    - Email already registered → "This email is already registered."
    - Weak password → "Password does not meet requirements."
- Sign in:
  - Unknown email or wrong password → "Invalid email or password."
  - Network/server → "Unable to sign in. Please try again."
- Forgot password:
  - Always show success message to avoid account enumeration: "If an account exists, we sent a reset link."
- Reset password:
  - Missing/invalid token → "Reset link is invalid or expired." Show link to request new reset.
- OAuth:
- Start failure → global error: "Unable to start Google sign-in. Please try again."
- Callback failure (invalid/expired code) → "Google sign-in link is invalid or expired."

### Key Scenarios

- Fresh visitor signs up, then signed-in banner in `Nav`, preserved catalog behavior.
- Returning user signs in; statuses and notes operations keep using server-resolved user id (via Supabase session) instead of `SAMPLE_USER`.
- Password reset email flows through Supabase; resetting updates password and invalidates existing sessions.
- Logout clears client session and redirects to landing or sign-in; private routes inaccessible after.

---

## 2) BACKEND LOGIC

### oRPC Router Additions

Add a new `auth` namespace in `src/orpc/router/index.ts`:

- `auth.register` – Registers a user with email/password.
- `auth.login` – Signs in with email/password.
- `auth.logout` – Signs out current session.
- `auth.forgotPassword` – Sends a password reset email.
- `auth.resetPassword` – Confirms password reset using token.
- `auth.getSession` – Returns the current session and profile summary.
- `auth.oauthStart` – Returns an OAuth provider authorization URL (Google) for redirect.
- `auth.oauthCallback` – Exchanges the returned `code` for a session.
- `auth.deleteAccount` – Deletes the current user's account and cascades app data.

### Contracts (Zod Schemas in `src/orpc/schema.ts`)

- `AuthEmailSchema = z.string().trim().email()`
- `PasswordSchema = z.string().min(8).max(72).regex(/^(?=.*[A-Za-z])(?=.*\d).+$/)`
- `AuthRegisterInput = { email: AuthEmailSchema, password: PasswordSchema }`
- `AuthLoginInput = { email: AuthEmailSchema, password: z.string().min(1) }`
- `AuthForgotPasswordInput = { email: AuthEmailSchema }`
- `AuthResetPasswordInput = { accessToken: z.string().min(1), newPassword: PasswordSchema }`
- `AuthSessionOutput = { userId: z.string().uuid().nullable(), email: z.string().email().nullable(), isAdmin: z.boolean().default(false), expiresAt: z.number().int().nullable() }`
- `AuthSuccess = { success: z.literal(true) }`
- All mutations return either `AuthSuccess` or throw typed `ORPCError` with safe messages per UI spec.
- `AuthOAuthProvider = z.enum(["google"])`
- `AuthOAuthStartInput = { provider: AuthOAuthProvider, redirectTo: z.string().url().optional() }`
- `AuthOAuthStartOutput = { url: z.string().url() }`
- `AuthOAuthCallbackInput = { code: z.string().min(1) }`
- `AuthDeleteAccountInput = { confirm: z.literal(true) }`

### Handlers (`src/orpc/router/auth.ts`)

Handlers run on server, using Supabase Admin/Server SDK with request context cookies:

- `register`: `supabase.auth.signUp({ email, password, options: { emailRedirectTo: <reset url> } })`. On success, optionally create `profiles` row (RLS will also allow on first sign-in via trigger; we ensure idempotence).
- `login`: `supabase.auth.signInWithPassword({ email, password })`. Returns success; session cookie is set server-side.
- `logout`: `supabase.auth.signOut()`.
- `forgotPassword`: `supabase.auth.resetPasswordForEmail(email, { redirectTo: <reset url> })`.
- `resetPassword`: `supabase.auth.exchangeCodeForSession(accessToken)` then `supabase.auth.updateUser({ password: newPassword })`.
- `getSession`: reads session from server client; returns `{ userId, email, isAdmin, expiresAt }` using `profiles.is_admin` if present.
- `oauthStart`: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` and return `{ url }`.
- `oauthCallback`: `supabase.auth.exchangeCodeForSession(code)` then return success.
- `deleteAccount`: requires authenticated user; in a server-side context using a service-role Supabase client:
  1.  Delete user-owned app data (`user_move_statuses`, notes) by `user_id`.
  2.  Delete `profiles` row for the user.
  3.  Call Admin API to delete the Supabase auth user.
      Return success. Map insufficient privileges or missing session to `UNAUTHORIZED`.

All handlers map Supabase errors to `ORPCError` codes:

- `BAD_REQUEST` for validation/invalid reset code
- `UNAUTHORIZED` for invalid credentials
- `CONFLICT` for duplicate email
- `INTERNAL_SERVER_ERROR` for unexpected
- `BAD_REQUEST` for invalid/expired OAuth code; `UNAUTHORIZED` for missing session in `deleteAccount`

### Input Validation

- All inputs validated via Zod in `@orpc/server` `.input(...)` pipes, mirroring UI schemas, ensuring symmetry. No `any` types.

### Exception Handling

- Use `ORPCError(code, { message })` consistently. Avoid leaking Supabase internals. Log server-side only via structured logger (future; no console in rules).

### Data Model Impacts

- Keep existing `profiles` table; on first sign-in/registration, ensure a row exists for the user (default `is_admin=false`).
- Replace `SAMPLE_USER` usage in `user-move-statuses.set` by reading current `userId` from session context; throw `UNAUTHORIZED` if absent.
- Account deletion: ensure foreign keys or explicit deletes cover `user_move_statuses` and any note storage. Profiles are removed; no admin can read user notes by design.

---

## 3) AUTHENTICATION SYSTEM (Supabase + TanStack Start)

### Supabase Client Wiring

- Add `src/integrations/supabase/server.ts`:
  - Exports `getSupabaseServerClient({ headers, cookies })` using `@supabase/ssr` helper to read/write auth cookies in SSR handlers and oRPC context.
- Add `src/integrations/supabase/client.ts` for browser usage when needed (e.g., sign out fallback), though forms call oRPC to keep SSR cookie in sync.

### Router Context & oRPC Context

- Extend oRPC `RPCHandler` context in `routes/api.rpc.$.ts` to pass request/response cookie utilities to the router:
  - Provide `{ supabase: getSupabaseServerClient({ request }) }` in context.
- In `src/orpc/client.ts` server-side branch, continue forwarding request headers so Supabase cookie session is available.
- Provide access to a service-role Supabase admin client in server context for `auth.deleteAccount` only.

### Guards & Navigation

- Guest-only pages (`sign-in`, `sign-up`, `forgot-password`, `reset-password`) check session via `auth.getSession` in SSR loader; redirect to `/catalog` if authenticated.
- Auth-only pages check session; redirect to `/auth/sign-in` if not authenticated.
- Admin-only pages: check `isAdmin`; redirect to `/auth/sign-in` if unauthenticated; return 403/redirect if authenticated but not admin. Admin writes are further protected by RLS and server-side role checks.

### Logout Flow

- Call `auth.logout` mutation; on success, invalidate TanStack Query `authSession` key and navigate to landing.

### Password Recovery Flow

- Request: `auth.forgotPassword` triggers email with `redirectTo` pointing to `/auth/reset-password` route which reads `code` (access token) from query.
- Reset: `auth.resetPassword` validates token and updates password; UI then navigates to `sign-in` with success notice.

### Google OAuth Flow

- Start: client calls `auth.oauthStart({ provider: 'google', redirectTo })` and navigates to returned URL.
- Callback: Supabase redirects to `/auth/oauth-callback?code=...`; server exchanges `code` for a session and redirects to last-visited or catalog.

### Account Deletion Flow

- From `routes/account.tsx`, user confirms deletion; client calls `auth.deleteAccount({ confirm: true })`.
- Server deletes user app data and auth user; on success, UI navigates to landing with a success notice.

---

## Contracts Summary

- oRPC procedures:
  - `auth.register(AuthRegisterInput) -> AuthSuccess`
  - `auth.login(AuthLoginInput) -> AuthSuccess`
  - `auth.logout() -> AuthSuccess`
  - `auth.forgotPassword(AuthForgotPasswordInput) -> AuthSuccess`
  - `auth.resetPassword(AuthResetPasswordInput) -> AuthSuccess`
  - `auth.getSession() -> AuthSessionOutput`
  - `auth.oauthStart(AuthOAuthStartInput) -> AuthOAuthStartOutput`
  - `auth.oauthCallback(AuthOAuthCallbackInput) -> AuthSuccess`
  - `auth.deleteAccount(AuthDeleteAccountInput) -> AuthSuccess`
- UI forms call these via `orpc.mutation`/`orpc.query` utilities.

---

## Non-Functional & Compatibility

- No breaking changes to existing moves catalog and status APIs.
- Replace placeholder `SAMPLE_USER` by session-derived `userId` behind auth. Until auth is enabled, keep behavior by feature-flag: if no session, allow `SAMPLE_USER` in demo mode only; disable in production.
- Follow accessibility and code-quality rules (Ultracite/Biome).

---

## Validation & Error Matrix (samples)

- Registration
  - 400: invalid email/password → inline field errors
  - 409: email exists → global error message
- Login
  - 401: invalid credentials → "Invalid email or password"
- Forgot
  - 200 always → success banner
- Reset
  - 400: missing/invalid token → prompt re-request
- OAuth
- 400: invalid/expired code → prompt retry sign-in
- 500: provider/unexpected errors → global error, retry later
- Delete Account
- 401: missing session → require sign-in
- 500: unexpected → show non-blocking error, instruct to contact support

---

## Open Questions (tracked for implementation)

- Email confirmation policy: require confirmation before sign-in? If yes, `register` returns success with next-steps banner.
- Where to store last-visited path for post-login redirect: cookie vs localStorage.
