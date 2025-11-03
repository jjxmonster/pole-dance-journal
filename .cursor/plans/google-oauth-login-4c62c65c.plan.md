<!-- 4c62c65c-197d-4b64-b77d-e561244412d3 d5546b4f-cbd7-4c1e-838e-a8153c471152 -->
# Implement Google OAuth Sign-in

## Overview

Add Google OAuth authentication using existing oRPC procedures (`oauthStart`, `oauthCallback`) with automatic profile creation and redirect handling.

## Key Files to Modify

### 1. `src/routes/auth/sign-in.tsx`

Add Google sign-in handler that calls `orpc.auth.oauthStart.call()` and redirects browser to Google OAuth URL.

### 2. `src/routes/auth/oauth-callback.tsx`

Implement the empty `processOAuthCallback` function to:

- Extract `code` from URL search params
- Call `orpc.auth.oauthCallback.call({ code })`
- Fetch session and update auth context
- Redirect to `/catalog` or `redirectTo` param
- Handle errors with user-friendly messages

### 3. `src/orpc/router/auth.ts`

Update `oauthCallback` procedure to:

- After successful `exchangeCodeForSession`, get user data
- Check if profile exists in database
- If not exists, create profile with `isAdmin: false`
- Return success

## Implementation Details

**OAuth Flow:**

1. User clicks "Continue with Google" button
2. `oauthStart` returns OAuth URL, browser navigates to Google
3. Google redirects back to `/auth/oauth-callback?code=...`
4. `oauthCallback` exchanges code for session and creates profile if needed
5. User redirected to catalog

**Profile Creation:**
Use try-catch with database query to check profile existence, insert if missing (handling race conditions with unique constraint).

**Error Handling:**

- Missing/invalid code → "Invalid sign-in link"
- OAuth errors → "Failed to complete Google sign-in"
- Show error in callback page UI with retry link

### To-dos

- [ ] Update oauthCallback in auth.ts to create profile for first-time OAuth users
- [ ] Implement processOAuthCallback function in oauth-callback.tsx
- [ ] Add handleGoogleSignIn to sign-in.tsx and pass to SignInForm
- [ ] Verify complete OAuth flow works end-to-end