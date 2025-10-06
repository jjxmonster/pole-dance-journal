# PRD - Pole Journal

## 1. Product Overview

Pole Journal is a mobile-first web application that helps pole dance practitioners track their learning progress for moves. The MVP provides a browsable, SEO-friendly public catalog of moves and a private workspace for users to mark status and capture personal notes. An admin panel allows curators to manage move data and generate illustrative images using AI.

Objectives:

- Provide a simple, delightful way to find moves, set a personal status, and keep brief notes.
- Enable admins to create and maintain a high-quality move catalog, including AI-generated images with an efficient acceptance workflow.
- Ensure privacy for users’ notes and secure, role-based access to admin functionality.

Scope: deliver the smallest set that proves value and retention without social features, advanced analytics, or scheduling.

Assumptions:

- Supabase is used for Auth, database, storage, and RLS. Notes are encrypted at rest by Supabase.
- Public pages (landing page) are SSR and indexable; private (catalog, move details) and admin pages are not indexable.
- Data volumes in MVP are modest (≤ 100–300 published moves) and fit within Supabase Free and Vercel Free constraints.

## 2. User Problem

Pole dancers lack a centralized digital place to track which moves they want to learn, are working on, or have mastered, and to keep short, private notes. As a result, they forget progress, duplicate effort, and feel less motivated due to scattered information and lack of visibility. Pole Journal addresses this by providing a structured catalog, personalized statuses, and private notes with reliable autosave.

## 3. Functionality Requirements

### 3.1 User-facing

- Authentication: Supabase Auth with email+password and Google OAuth. Logout and password reset included.
- Catalog browsing: list of moves with name, difficulty level (Beginner, Intermediate, Advanced), short description, and image.
- Filtering: by difficulty level (All, Beginner, Intermediate, Advanced). Filters persist in URL.
- Search: text search across move name and description; case- and diacritics-insensitive; debounced input.
- Move details: name, level, description, ordered steps (each with title and description), AI image, and clear CTAs to set status and edit a private note.
- Statuses: exactly one status per (user, move) with allowed values Want, Almost, Done, mapping in UI to Polish texts: Chcę zrobić, Prawie, Zrobione. Users can update status at any time; creating or updating a status adds the move to the user’s profile.
- Notes: private to the author; length 0–2000 characters; autosave every 2 seconds; localStorage backup and retry with exponential backoff (3 attempts) on transient errors.
- My Moves: personalized list of all moves where the user has a status or note; tabs for All plus per-level tabs; ability to change status inline and edit notes.
- Onboarding: 2-step lightweight tour (Welcome + catalog tooltip) with Skip option.
- Account deletion: user-initiated, with confirmation; cascades removal of user statuses and notes; profiles are anonymized or removed.

### 3.2 Admin-facing

- Secure admin area at /admin, accessible only to authenticated users with admin role; guarded server-side and client-side.
- Create/edit move: name, description, difficulty level; manage steps (2–15, each with title and description). Slug is generated and unique.
- Image workflow: upload a single reference image (JPG/PNG up to 5 MB) → trigger AI generation using flux-schnell → preview → accept or regenerate. Final accepted AI image is stored as public.
- Publish/unpublish: control visibility in catalog; soft delete via deleted_at on moves to hide from catalog while preserving user history.
- Basic management: list moves, filter by level/status (published/unpublished/soft-deleted), edit, soft delete, restore.

### 3.3 Data model and validations

- Entities
  - User (from Supabase Auth)
  - Profile: id, user_id, user_move_statuses
  - Move: id, name, description, level in {Beginner, Intermediate, Advanced}, slug, ai_image_url, reference_image_url, published_at, deleted_at
  - Step: id, move_id, order_index, title, description
  - UserMoveStatus: user_id, move_id, status in {WANT, ALMOST, DONE}, note (0–2000 chars), updated_at
- Soft delete: moves have deleted_at; soft-deleted moves are excluded from catalog and sitemap; they remain visible in My Moves as Archived/No longer available.
- Slugs: generated from name, unique, lowercase, diacritics removed, words separated by hyphens.

### 3.4 Security and privacy

- Auth: Supabase Auth; SSR guards for protected routes; RLS on all tables to ensure users can only access their own statuses and notes; admins cannot access private notes.
- Notes stored encrypted at rest by Supabase; no public exposure via storage buckets.
- Admin actions limited to users with admin role; endpoints validate role server-side.

### 3.5 Performance, reliability, and offline behavior

- SSR for public catalog to optimize first load and SEO.
- Search debounced at 250 ms; client-side search when catalog size ≤ 100; server-side fallback beyond that threshold.
- Notes autosave: runs every 2 seconds when dirty; retries failed saves up to 3 times with exponential backoff; localStorage backup restored if network errors persist.
- No background jobs or push notifications in MVP.

### 3.6 Accessibility and internationalization

- UI content in Polish for MVP; architecture ready for future i18n.
- Adhere to accessibility: semantic HTML, labeled inputs, focus management, keyboard interaction for interactive elements, meaningful alt text; no distracting or improper ARIA usage.

### 3.7 SEO and SSR

- Public catalog and move details are SSR and indexable; per-page meta tags (title, description, canonical).
- robots.txt and dynamic sitemap.xml include only published, non-deleted moves.
- Soft-deleted move detail by direct URL returns 410 Gone and includes meta noindex, nofollow.
- Private pages (My Moves) and /admin include meta noindex, nofollow.

### 3.8 Environments and deployment

- Hosting on Vercel Free; database/storage on Supabase Free. Local development uses local Supabase.
- CI/CD with GitHub Actions. Database migrations versioned in supabase/migrations/.
- Optional staging via Vercel preview deployments.

## 4. Granice produktu

### 4.1 Out of scope for MVP

- Instructional videos (text and images only)
- Social features (sharing, comments, following)
- Advanced statistics and progress charts
- Training sessions/schedules with calendar
- Reminders and push notifications
- Import/export of data
- Native mobile apps (web/PWA only)
- Ratings and reviews
- Wearables/fitness tracker integrations
- Multiple roles beyond User/Admin
- Advanced search (tags, muscle groups, etc.)
- Monitoring and analytics

### 4.2 Constraints and limitations

- Supabase and Vercel Free tier quotas may limit storage/egress; AI images should be optimized for size and cached via CDN.
- Single reference image per move in MVP; AI image generation via flux-schnell only.
- No background processing queue; AI generation must be triggered on demand from admin panel.

### 4.3 Open decisions and risks

- Notes storage model: as a column on UserMoveStatus vs separate table; plan is to keep note on UserMoveStatus with updated_at to meet autosave and privacy needs.
- Steps modeling: Step as relational table (selected), no redundant Move.steps field to avoid inconsistency.
- Status enum: WANT, ALMOST, DONE with Polish labels shown in UI; codes stored in English-like enums.
- Search logic: case/diacritics-insensitive; client-side for ≤ 100 moves, else server-side filtering.
- SEO for soft-deleted: serve 410 Gone and noindex; canonical points to catalog if needed.
- Image moderation: upload and AI outputs must pass basic content safety rules; provide admin-only regenerate with sensible rate limiting.
- Admin protection: SSR guards and RLS on all write endpoints to prevent direct endpoint access.
- KPI measurement: consider minimal event logging later; MVP relies on Supabase queries over core tables.
- Budget and storage: monitor image storage usage; set internal limits and cleanup policies for unused AI candidates.

## 5. User Stories

ID: US-AUTH-001
Title: Register with email and password
Description: As a new user, I want to create an account with email and password so that I can save my statuses and notes.
Acceptance Criteria:

- Given I am on the registration form, when I provide a valid email and password and submit, then my account is created and I am signed in.
- Password strength and email format are validated; clear error messages on failure.
- If the email is already registered, I see an appropriate error.

ID: US-AUTH-002
Title: Sign in with email and password
Description: As a returning user, I want to log in with my email and password to access My Moves and notes.
Acceptance Criteria:

- Successful sign-in redirects to the catalog or last-visited page.
- Invalid credentials show a non-specific error for security.
- Rate limiting is enforced by the auth provider.

ID: US-AUTH-003
Title: Sign in with Google
Description: As a user, I want to log in with my Google account for convenience.
Acceptance Criteria:

- Google OAuth completes and grants access without exposing private data to other users.
- Users created via Google can still set a password later if desired.

ID: US-AUTH-004
Title: Password reset
Description: As a user who forgot the password, I want to reset it via email.
Acceptance Criteria:

- Requesting reset sends an email via Supabase; following the link allows setting a new password.
- Tokens expire and cannot be reused.

ID: US-AUTH-005
Title: Sign out
Description: As a signed-in user, I want to sign out to secure my account on shared devices.
Acceptance Criteria:

- After sign-out, My Moves and admin routes are inaccessible.

ID: US-SEC-001
Title: Protect admin area
Description: As an admin, I want the /admin area and write endpoints to be inaccessible to non-admins.
Acceptance Criteria:

- Non-authenticated users are redirected to sign-in.
- Authenticated non-admins receive 403 on server-side and never see admin UI.
- RLS prevents non-admins from performing admin writes even via direct API calls.

ID: US-CAT-001
Title: Browse catalog
Description: As a visitor, I want to browse a list of published moves to discover what to learn.
Acceptance Criteria:

- List shows name, level, short description, and image for each move.
- Pagination or lazy-loading is supported if needed for performance.

ID: US-CAT-002
Title: Filter by level
Description: As a visitor, I want to filter moves by difficulty level.
Acceptance Criteria:

- Filter options: All, Beginner, Intermediate, Advanced.
- URL reflects the active filter for sharing and back/forward navigation.

ID: US-CAT-003
Title: Search moves
Description: As a visitor, I want to quickly find moves by typing a query.
Acceptance Criteria:

- Search matches name and description; case- and diacritics-insensitive.
- Input is debounced at 250 ms.
- Client-side search for ≤ 100 moves; server-side filtering beyond that.

ID: US-MOVE-001
Title: View move details
Description: As a visitor, I want to see the full details of a move.
Acceptance Criteria:

- Page shows name, level, description, steps (ordered), and AI image.
- If the move is soft-deleted, direct access returns 410 Gone with noindex and a user-friendly message.

ID: US-STATUS-001
Title: Set status to Want
Description: As a signed-in user, I want to mark a move as Want to learn.
Acceptance Criteria:

- Setting status creates or updates a single UserMoveStatus for the user and move.
- UI shows Polish label Chcę zrobić.

ID: US-STATUS-002
Title: Update status to Almost or Done
Description: As a signed-in user, I want to update my status as I progress.
Acceptance Criteria:

- Allowed transitions among Want, Almost, Done without restrictions.
- Updated_at reflects the latest change.

ID: US-NOTE-001
Title: Add and edit a private note
Description: As a signed-in user, I want to keep private notes per move.
Acceptance Criteria:

- Notes accept 0–2000 characters; saving respects autosave cadence.
- Notes are visible only to the author; admins cannot view them.

ID: US-NOTE-002
Title: Autosave and offline resilience
Description: As a user, I want my note edits to be saved automatically and not lost if I go offline.
Acceptance Criteria:

- On failure, retry up to 3 times with exponential backoff; if still failing, backup to localStorage and show a non-blocking error.
- On next load, the user is prompted to restore from backup if newer than server content.

ID: US-MY-001
Title: View My Moves
Description: As a signed-in user, I want to see all moves I have interacted with.
Acceptance Criteria:

- List includes any move with a status or note.
- Tabs: All, Beginner, Intermediate, Advanced.
- Inline status change is available; notes are editable.
- Soft-deleted moves appear as Archived/No longer available; status remains editable, notes persist.

ID: US-ONB-001
Title: Two-step onboarding
Description: As a new user, I want a short guided tour that I can skip.
Acceptance Criteria:

- Shows two steps: Welcome and catalog tip.
- Skip option dismisses the tour and does not show again unless reset.

ID: US-ADMIN-001
Title: Add a new move
Description: As an admin, I want to create a move with required fields and steps.
Acceptance Criteria:

- Validations: name 3–100 unique, description 10–500, steps 2–15 with title 3–150 and description 10–150.
- Level set to one of Beginner, Intermediate, Advanced.
- Slug generated and unique; duplicate names produce disambiguated slugs.

ID: US-ADMIN-002
Title: Edit a move
Description: As an admin, I want to update fields and steps.
Acceptance Criteria:

- Step reordering and edits are saved; validations enforced.
- Changes to name update slug only if not published or explicitly confirmed.

ID: US-ADMIN-003
Title: Upload reference image
Description: As an admin, I want to upload a single JPG/PNG up to 5 MB as a reference.
Acceptance Criteria:

- Invalid type or size is rejected with clear error.
- Image is stored privately until AI image is accepted.

ID: US-ADMIN-004
Title: Generate AI image and accept/regenerate
Description: As an admin, I want to generate an AI image, preview it, and either accept or regenerate.
Acceptance Criteria:

- AI generation via flux-schnell produces a preview within acceptable time.
- Accepting stores the image publicly and associates it with the move.
- Regenerate replaces the preview; reasonable per-session limits prevent abuse.

ID: US-ADMIN-005
Title: Publish/unpublish/soft delete
Description: As an admin, I want to control move visibility.
Acceptance Criteria:

- Publish shows the move in catalog and sitemap.
- Unpublish hides from catalog and sitemap but keeps 200/OK for direct access with noindex.
- Soft delete sets deleted_at, removes from catalog and sitemap, and direct URL returns 410 Gone with noindex.

ID: US-ADMIN-006
Title: Manage moves list
Description: As an admin, I want to view and filter moves by level and state.
Acceptance Criteria:

- List supports filtering by level and state (published, unpublished, soft-deleted) and simple text search by name.
