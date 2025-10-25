# UI Architecture for Pole Journal

## 1. UI Structure Overview

Pole Journal follows a **mobile-first, progressively enhanced architecture** built on TanStack Start, React 19, TypeScript, Tailwind 4, and Shadcn/ui. The application is organized into three distinct security zones:

1. **Public Zone (SSR, Indexable)**: Landing page optimized for SEO and discovery
2. **Catalog Zone (SSR, Conditionally Indexable)**: Public catalog and move details accessible to all, with enhanced features for authenticated users
3. **Authenticated Zone (Private, Not Indexable)**: Personalized dashboard and account management
4. **Admin Zone (Private, Role-Protected, Not Indexable)**: Move management and content curation

The architecture employs **server-side rendering for public pages** to optimize SEO and first-load performance, while private and admin areas use appropriate meta tags (noindex, nofollow). All data fetching is managed through **TanStack React Query with oRPC** for type-safe API communication, optimistic updates, and automatic cache management.

**Core Architectural Principles:**

- Mobile-first responsive design with thumb-reachable primary actions
- Optimistic UI updates with automatic rollback on errors
- Consistent loading, empty, and error state patterns across all views
- Accessibility compliance (WCAG 2.1 AA)
- Row Level Security (RLS) via Supabase for data protection
- Polish language UI text with architecture ready for future internationalization

## 2. View List

### 2.1. Landing Page

- **View Path**: `/`
- **Access Level**: Public (SSR, Indexable)
- **Main Purpose**: Marketing page to introduce Pole Journal, communicate value proposition, and drive sign-ups
- **Key Information to Display**:
  - Hero section with product tagline, benefits summary, and primary CTA (Sign Up / Start Learning)
  - Features showcase highlighting key capabilities (catalog browsing, progress tracking, private notes)
  - Benefits section emphasizing motivation, organization, and privacy
  - Social proof or testimonials (future consideration)
  - Secondary CTA section with clear sign-up path
  - Footer with links to catalog, about, privacy policy, terms
- **Key View Components**:
  - `Hero` component: Full-viewport hero with background image, headline, subheadline, primary CTA button
  - `Features` component: Grid of feature cards with icons, titles, and descriptions
  - `Benefits` component: Alternating layout showcasing key benefits with supporting visuals
  - `CTA` component: Prominent call-to-action section with sign-up button
  - `Nav` component: Public navigation with Logo, Browse/Catalog link, Sign In, Sign Up buttons
  - `Footer` component: Site links and legal information
- **UX Considerations**:
  - Clear visual hierarchy guiding users to primary CTA
  - Fast load times via SSR and optimized images
  - Scroll-based reveal animations for sections (subtle, non-distracting)
  - Mobile-first layout with single-column stacking, multi-column on desktop
- **Accessibility Considerations**:
  - Semantic HTML structure (header, main, section, footer)
  - Skip link to main content
  - Sufficient color contrast for all text
  - CTA buttons with clear, action-oriented labels
  - Alt text for all hero and feature images
- **Security Considerations**:
  - Public content with no sensitive data exposure
  - Sign-up/Sign-in links redirect to authentication views

### 2.2. Sign In

- **View Path**: `/auth/sign-in`
- **Access Level**: Public (SSR)
- **Main Purpose**: Authenticate returning users via email/password or Google OAuth
- **Key Information to Display**:
  - Sign-in form with email and password fields
  - "Forgot password?" link
  - Google OAuth button
  - Link to sign-up page for new users
  - Error messages for invalid credentials
- **Key View Components**:
  - `SignInForm` component: Form with email input, password input, submit button
  - `GoogleAuthButton` component: Branded Google sign-in button
  - `Alert` component (Shadcn): Display authentication errors
  - `Button` component (Shadcn): Primary action button for form submission
  - `Input` component (Shadcn): Form fields with labels
- **UX Considerations**:
  - Autofocus on email field for quick entry
  - Password visibility toggle
  - Loading state on submit button during authentication
  - Clear error messaging without exposing security details (e.g., "Invalid email or password")
  - Redirect to intended destination or catalog after successful sign-in
- **Accessibility Considerations**:
  - Form labels properly associated with inputs
  - Error messages announced to screen readers
  - Keyboard navigation through form fields and buttons
  - Focus management (return to first field with error on validation failure)
- **Security Considerations**:
  - HTTPS enforced
  - No client-side password validation beyond basic format check
  - Rate limiting handled by Supabase Auth
  - JWT token stored securely (httpOnly cookie or localStorage with appropriate precautions)
  - CSRF protection via Supabase Auth

### 2.3. Sign Up

- **View Path**: `/auth/sign-up`
- **Access Level**: Public (SSR)
- **Main Purpose**: Register new users via email/password or Google OAuth
- **Key Information to Display**:
  - Sign-up form with email and password fields
  - Password strength indicator
  - Google OAuth button
  - Link to sign-in page for existing users
  - Error messages for validation failures or existing accounts
- **Key View Components**:
  - `SignUpForm` component: Form with email input, password input, password confirmation, submit button
  - `GoogleAuthButton` component: Branded Google sign-in button
  - `PasswordStrengthIndicator` component: Visual indicator for password quality
  - `Alert` component (Shadcn): Display validation or registration errors
  - `Button` component (Shadcn): Primary action button
  - `Input` component (Shadcn): Form fields with labels
- **UX Considerations**:
  - Real-time password strength feedback
  - Clear validation messages for email format and password requirements
  - Loading state during account creation
  - Automatic sign-in and redirect to onboarding tour after successful registration
- **Accessibility Considerations**:
  - Form labels and error messages properly associated
  - Password strength indicator accessible to screen readers
  - Keyboard navigation and form submission
- **Security Considerations**:
  - Client-side validation for format only; server-side validation enforced
  - Passwords never exposed in logs or error messages
  - Email verification flow (optional for MVP, but architecture ready)

### 2.4. Password Reset

- **View Path**: `/auth/reset-password`
- **Access Level**: Public (SSR)
- **Main Purpose**: Allow users to reset forgotten passwords via email link
- **Key Information to Display**:
  - Step 1 (Request): Email input field and submit button
  - Step 2 (Confirmation): Success message with instructions to check email
  - Step 3 (Reset Form, from email link): New password input and confirmation
- **Key View Components**:
  - `PasswordResetRequestForm` component: Email input and submit button
  - `PasswordResetForm` component: New password input, confirmation input, submit button
  - `Alert` component (Shadcn): Success/error messages
  - `Button` component (Shadcn): Submit buttons
  - `Input` component (Shadcn): Form fields
- **UX Considerations**:
  - Clear multi-step flow with progress indication
  - Success message that doesn't reveal whether email exists (security)
  - Redirect to sign-in after successful password reset
- **Accessibility Considerations**:
  - Clear labels and instructions
  - Error messages announced to screen readers
- **Security Considerations**:
  - Reset tokens expire after set period
  - Tokens are single-use and invalidated after use
  - No indication whether email exists in system (prevent enumeration)

### 2.5. Catalog / Browse Moves

- **View Path**: `/catalog` or `/moves`
- **Access Level**: Public (SSR, Indexable)
- **Main Purpose**: Browse, search, and filter the published move catalog; primary discovery interface
- **Key Information to Display**:
  - Full-width search input at top
  - Level filter badges (All, Beginner, Intermediate, Advanced) below search
  - Grid of move cards showing image, name, level badge
  - For authenticated users: status indicator and quick actions on hover/tap
  - Pagination or infinite scroll controls
  - Move count and active filters summary
  - Empty state if no moves match filters
- **Key View Components**:
  - `SearchBar` component: Full-width input with search icon and clear button
  - `LevelFilterBadges` component: Clickable badge group for level filtering
  - `MoveCard` component (Catalog variant): Image, name, level badge, optional status indicator
  - `Pagination` component: Page controls or infinite scroll trigger
  - `EmptyState` component: Illustrative message when no results found
  - `SkeletonCard` component: Loading placeholder for move cards
- **UX Considerations**:
  - Search debounced at 250ms to reduce unnecessary API calls
  - Filters persist in URL for shareable/bookmarkable states
  - Optimistic filter updates (immediate UI response)
  - Client-side search for ≤100 moves, server-side beyond threshold
  - Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
  - Hover/tap on card shows brief animation and highlights interactivity
  - For authenticated users: subtle status badge overlay on cards
- **Accessibility Considerations**:
  - Search input with clear label ("Search moves")
  - Filter badges keyboard-navigable and announced as buttons
  - Move cards as links to detail page with descriptive accessible names
  - Empty state with clear messaging and alternative actions
  - Focus management when filters change
- **Security Considerations**:
  - Only published, non-deleted moves visible
  - User-specific status data fetched separately (not exposed in public catalog API)
  - RLS ensures authenticated users can only see their own statuses

### 2.6. Move Detail

- **View Path**: `/moves/:slug`
- **Access Level**: Public (SSR, Indexable for published moves)
- **Main Purpose**: Display complete move information including steps; allow authenticated users to set status and edit notes
- **Key Information to Display**:
  - Move name (heading)
  - Difficulty level badge
  - AI-generated image (large, prominent)
  - Full description
  - Ordered list of steps, each with title and description
  - For authenticated users:
    - Status dropdown/segmented control (Want, Almost, Done / Chcę zrobić, Prawie, Zrobione)
    - Note editor section with expandable textarea
    - Character counter (0/2000)
    - Save status indicator (Saved/Saving.../Failed)
  - Related moves or breadcrumb navigation
- **Key View Components**:
  - `MoveHeader` component: Name, level badge, status dropdown (authenticated)
  - `MoveImage` component: Responsive image with proper aspect ratio
  - `MoveDescription` component: Formatted text block
  - `StepsList` component: Ordered list of step cards
  - `StepCard` component: Step number, title, description
  - `StatusDropdown` component: Dropdown or segmented control for status selection
  - `NoteEditor` component: Expandable textarea with character counter, save indicator, autosave logic
  - `Breadcrumbs` component: Navigation path (Catalog > Move Name)
- **UX Considerations**:
  - Single-column layout on mobile, centered max-width on desktop
  - Image loads with skeleton placeholder
  - Steps clearly numbered and visually separated
  - For authenticated users:
    - Status change is inline with optimistic update
    - Toast notification (Sonner) on successful status change
    - Note editor expands on focus, shows character count in real-time
    - Autosave indicator provides transparent feedback (Saved/Saving.../Failed)
    - Non-blocking error notification if save fails, with "Save to device" option
  - On mobile: sticky bottom bar with primary actions (Status dropdown, Add/Edit Note button)
- **Accessibility Considerations**:
  - Semantic heading hierarchy (h1 for move name, h2 for steps section, h3 for individual steps)
  - Image alt text describes the move
  - Status dropdown accessible via keyboard (arrow keys to select, Enter to confirm)
  - Textarea with label and character counter announced to screen readers
  - Autosave status updates announced to screen readers (aria-live region)
- **Security Considerations**:
  - Published moves visible to all
  - Unpublished moves return 404 for non-admins
  - Soft-deleted moves return 410 Gone with noindex meta tag
  - User status and notes visible only to authenticated user via RLS
  - Note editor only rendered for authenticated users

### 2.7. My Moves

- **View Path**: `/my-moves`
- **Access Level**: Authenticated (Private, Not Indexable)
- **Main Purpose**: Personalized dashboard showing all moves where user has set a status or written a note
- **Key Information to Display**:
  - Tab navigation: All, Beginner, Intermediate, Advanced
  - List of move cards (My Moves variant) showing:
    - Move image, name, level badge
    - Status badge (Want/Almost/Done in Polish)
    - Note indicator icon (if note exists)
    - Quick status change dropdown
    - Deleted/archived state label if soft-deleted
  - Empty state if no moves in selected tab
  - Floating "+" button for quick catalog access
- **Key View Components**:
  - `TabNavigation` component: Level filter tabs
  - `MoveCard` component (My Moves variant): Enhanced card with status badge, note indicator, quick actions
  - `StatusDropdown` component: Inline status change control
  - `EmptyState` component: Message with CTA to browse catalog
  - `FloatingActionButton` component: Prominent "+" button linking to catalog
  - `ArchivedMoveBadge` component: Visual indicator for soft-deleted moves
- **UX Considerations**:
  - Active tab persists in URL
  - Quick status change with optimistic update and toast confirmation
  - Note indicator clickable to navigate to move detail for editing
  - Soft-deleted moves displayed with "Archived" badge and muted styling
  - Responsive grid layout (1 column mobile, 2-3 columns tablet/desktop)
  - Empty state encourages users to browse catalog and add moves
- **Accessibility Considerations**:
  - Tab navigation keyboard-accessible (arrow keys or Tab)
  - Active tab indicated visually and via aria-selected
  - Each move card is a navigable region with clear labeling
  - Status dropdown keyboard-operable
  - Empty state with clear CTA button
- **Security Considerations**:
  - View requires authentication; unauthenticated users redirected to sign-in
  - RLS ensures user only sees their own moves
  - Note data never exposed in card; only indicator icon shown

### 2.8. Account / Profile

- **View Path**: `/account`
- **Access Level**: Authenticated (Private, Not Indexable)
- **Main Purpose**: Manage user account settings, password, and account deletion; access onboarding tour
- **Key Information to Display**:
  - User email (non-editable for email/password accounts)
  - Password change section (for email/password accounts only)
  - Account deletion section with warning and confirmation
  - "Restart Onboarding Tour" button
  - Sign out button
- **Key View Components**:
  - `AccountInfo` component: Display user email and account type (email/Google)
  - `PasswordChangeForm` component: Current password, new password, confirm password fields
  - `AccountDeletionSection` component: Warning text, confirmation dialog, delete button
  - `Dialog` component (Shadcn): Confirmation modal for account deletion
  - `Button` component (Shadcn): Action buttons for password change, tour restart, sign out, delete
  - `Alert` component (Shadcn): Success/error messages
- **UX Considerations**:
  - Clear separation between different setting sections
  - Password change requires current password for security
  - Account deletion requires explicit confirmation with warning about data loss
  - Success messages for password change via toast notification
  - Sign out button clearly visible and labeled
  - Onboarding tour restart button for users who want to see it again
- **Accessibility Considerations**:
  - Clear section headings
  - Form fields properly labeled
  - Confirmation dialog traps focus and is keyboard-dismissible
  - Warning messages for destructive actions clearly announced
- **Security Considerations**:
  - Password change requires current password verification
  - Account deletion cascades to user statuses and notes (anonymization or removal)
  - Sign out clears session and redirects to landing page
  - RLS prevents viewing other users' account data

### 2.9. Admin Dashboard

- **View Path**: `/admin`
- **Access Level**: Admin Only (Private, Role-Protected, Not Indexable)
- **Main Purpose**: Overview and navigation hub for admin functions
- **Key Information to Display**:
  - Summary statistics (total moves, published moves, unpublished moves)
  - Quick links to move management, create new move
  - Recent activity or changes (optional for MVP)
- **Key View Components**:
  - `AdminNav` component: Admin-specific navigation with links to move list, create move
  - `StatsCard` component: Cards displaying key metrics
  - `QuickActions` component: Prominent buttons for common tasks
- **UX Considerations**:
  - Clear navigation to all admin functions
  - Dashboard provides context and quick access without overwhelming
- **Accessibility Considerations**:
  - Clear heading hierarchy
  - Navigation links with descriptive labels
- **Security Considerations**:
  - Access restricted to users with `is_admin` flag
  - Non-admin authenticated users receive 403 error
  - Unauthenticated users redirected to sign-in

### 2.10. Admin Move List

- **View Path**: `/admin/moves`
- **Access Level**: Admin Only (Private, Role-Protected, Not Indexable)
- **Main Purpose**: View, filter, and manage all moves (published, unpublished, soft-deleted)
- **Key Information to Display**:
  - Search bar for move name
  - Filter controls: Level (All, Beginner, Intermediate, Advanced), Status (All, Published, Unpublished, Deleted)
  - List or table of moves showing:
    - Move name (link to edit)
    - Level badge
    - Status badge (Published/Unpublished/Deleted)
    - Last updated date
    - Action buttons (Edit, Publish/Unpublish, Delete/Restore)
  - Pagination controls
- **Key View Components**:
  - `AdminSearchBar` component: Search input for move name
  - `AdminFilterControls` component: Filter dropdowns or badges
  - `AdminMoveCard` component or `AdminMoveTable` row: Compact display with actions
  - `ActionButtons` component: Edit, Publish/Unpublish, Delete buttons
  - `ConfirmDialog` component (Shadcn): Confirmation for destructive actions (delete)
  - `Pagination` component: Page controls
- **UX Considerations**:
  - Filters persist in URL for shareable states
  - Search debounced to reduce API calls
  - Quick actions (Publish/Unpublish) with optimistic updates
  - Confirmation dialog for soft delete action
  - Status badges clearly color-coded
  - Restore option for soft-deleted moves
- **Accessibility Considerations**:
  - Filter controls keyboard-accessible
  - Action buttons clearly labeled
  - Confirmation dialogs keyboard-operable and focus-trapped
- **Security Considerations**:
  - Admin-only access enforced server-side
  - All mutations validated against admin role

### 2.11. Create Move

- **View Path**: `/admin/moves/new`
- **Access Level**: Admin Only (Private, Role-Protected, Not Indexable)
- **Main Purpose**: Create a new move with name, description, level, and steps
- **Key Information to Display**:
  - Form with fields:
    - Move name (3-100 characters)
    - Description (10-500 characters)
    - Level dropdown (Beginner, Intermediate, Advanced)
    - Steps section (2-15 steps)
      - Each step: Title (3-150 chars), Description (10-150 chars)
      - Add/remove step buttons
      - Drag-to-reorder (optional enhancement)
  - Save as Draft and Publish buttons
  - Cancel button
- **Key View Components**:
  - `MoveForm` component: Complete form with all fields and validation
  - `StepEditor` component: Repeatable section for managing individual steps
  - `Input` component (Shadcn): Text inputs with validation feedback
  - `Textarea` component (Shadcn): Description fields
  - `Select` component (Shadcn): Level dropdown
  - `Button` component (Shadcn): Add step, remove step, save, cancel
  - `Alert` component (Shadcn): Validation errors
  - `ImageGenerator` component (Shadcn): Generate Move Image
- **UX Considerations**:
  - Real-time character counters for all text fields
  - Inline validation errors below fields
  - "Add Step" button disabled when max steps (15) reached
  - Step removal requires confirmation if content exists
  - Form state persists in case of navigation away (browser warning)
  - Loading state on submit button during API call
  - Redirect to move list or edit page after successful creation
- **Accessibility Considerations**:
  - All form fields properly labeled
  - Validation errors announced to screen readers
  - Step management buttons clearly labeled ("Add Step", "Remove Step 3")
  - Focus management when adding/removing steps
- **Security Considerations**:
  - Admin-only access enforced
  - Server-side validation of all inputs
  - Slug generation handled server-side to ensure uniqueness

### 2.12. Edit Move

- **View Path**: `/admin/moves/:id/edit`
- **Access Level**: Admin Only (Private, Role-Protected, Not Indexable)
- **Main Purpose**: Edit existing move details, steps, and manage images
- **Key Information to Display**:
  - Same form fields as Create Move, pre-populated with existing data
  - Additional: Image Management Section
    - Current AI image display (if exists)
    - Drag-and-drop upload zone for reference image (JPG/PNG, max 5MB)
    - "Generate AI Image" button (enabled after reference upload)
    - Loading state during AI generation
    - Side-by-side preview comparison (reference vs. AI-generated)
    - Action buttons: Accept, Regenerate (with counter), Cancel
  - Publish/Unpublish button (context-aware based on current state)
  - Delete button (soft delete)
- **Key View Components**:
  - `MoveForm` component: Reused from Create with edit mode
  - `StepEditor` component: Manage existing and new steps
  - `ImageManagementSection` component: Complete image workflow
  - `ImageUploader` component: Drag-and-drop zone with file validation
  - `ImagePreviewComparison` component: Side-by-side display
  - `AIGenerationControls` component: Generate, accept, regenerate buttons with loading states
  - `ConfirmDialog` component (Shadcn): Confirmation for delete action
- **UX Considerations**:
  - Pre-populated fields load with skeleton placeholders
  - Image upload with drag-and-drop and click-to-browse
  - File validation feedback (type, size)
  - AI generation shows loading spinner with progress indication
  - Preview comparison shows reference and AI image side-by-side
  - Regenerate button shows attempt counter to prevent abuse (e.g., "Regenerate (2/5)")
  - Accept button stores AI image and closes workflow
  - Changes saved individually or as complete form
  - Confirmation required for soft delete
- **Accessibility Considerations**:
  - Image upload zone keyboard-accessible with file input
  - Loading states announced to screen readers
  - Image previews with descriptive alt text
  - All action buttons clearly labeled
- **Security Considerations**:
  - Admin-only access enforced
  - File upload validates type and size server-side
  - AI generation rate-limited per session
  - Reference image stored privately until accepted
  - Final AI image stored publicly with unique URL

### 2.13. 404 Not Found

- **View Path**: Any unmatched route
- **Access Level**: Public
- **Main Purpose**: Handle non-existent routes with user-friendly messaging
- **Key Information to Display**:
  - 404 error message
  - Friendly explanation
  - Navigation options: Home, Browse Catalog, Search
- **Key View Components**:
  - `ErrorPage` component: Centered layout with error code and message
  - `Button` component (Shadcn): Navigation CTAs
- **UX Considerations**:
  - Clear, friendly messaging without technical jargon
  - Multiple navigation options to continue user journey
- **Accessibility Considerations**:
  - Clear heading and description
  - Keyboard-accessible navigation buttons
- **Security Considerations**:
  - No sensitive information exposed in error message

### 2.14. 410 Gone (Soft-Deleted Move)

- **View Path**: `/moves/:slug` for soft-deleted moves
- **Access Level**: Public (Not Indexable, nofollow)
- **Main Purpose**: Handle direct access to soft-deleted moves with appropriate HTTP status and messaging
- **Key Information to Display**:
  - 410 Gone status
  - Message: "This move is no longer available"
  - CTA to browse catalog
- **Key View Components**:
  - `ErrorPage` component: Similar to 404 but specific messaging
  - `Button` component (Shadcn): Navigate to catalog
- **UX Considerations**:
  - Clear explanation without technical details
  - Redirect to catalog after brief delay (optional)
- **Accessibility Considerations**:
  - Clear heading and message
  - Keyboard-accessible CTA
- **Security Considerations**:
  - 410 status prevents indexing
  - Meta noindex, nofollow included
  - No exposure of move data

## 3. User Journey Map

### 3.1. New User Journey (Primary Use Case)

**Goal**: Discover Pole Journal, sign up, explore catalog, mark first move as "Want to Learn", and add a note

**Step-by-Step Flow**:

1. **Discovery**: User arrives at Landing Page (/) via search, social media, or referral
   - Views hero section with product value proposition
   - Scrolls through features and benefits
   - Clicks primary CTA: "Start Learning" or "Sign Up"

2. **Registration**: Redirected to Sign Up (/auth/sign-up)
   - Enters email and password OR clicks "Sign in with Google"
   - Submits form
   - Account created, user automatically signed in

3. **Onboarding Tour** (Triggered immediately after first sign-in):
   - Step 1: Welcome modal appears with brief introduction
     - Message: "Welcome to Pole Journal! Track your progress and keep notes on moves."
     - Buttons: "Next", "Skip Tour"
   - User clicks "Next"
   - Step 2: Tooltip overlay on catalog navigation link
     - Message: "Browse all moves here. Set your status and add private notes to track progress."
     - Buttons: "Got it", "Skip"
   - User clicks "Got it"
   - Tour dismissed, stored in localStorage and/or database

4. **Catalog Exploration**: Redirected to Catalog (/catalog)
   - Views grid of move cards with images, names, and level badges
   - Scrolls through list
   - Uses level filter to select "Beginner"
   - Sees filtered results
   - Searches for specific move (e.g., "pole sit")
   - Views search results

5. **Move Detail**: Clicks on a move card
   - Navigates to Move Detail (/moves/pole-sit)
   - Reads move description
   - Reviews ordered steps
   - Views AI-generated image

6. **Set Status**: Decides to learn this move
   - Clicks status dropdown (shows: Want, Almost, Done / Chcę zrobić, Prawie, Zrobione)
   - Selects "Want" (Chcę zrobić)
   - Optimistic update: dropdown shows selected status immediately
   - Toast notification: "Status updated!" (success)
   - Move now appears in My Moves

7. **Add Note**: Wants to capture a thought
   - Scrolls to note section (or taps "Add Note" in mobile bottom bar)
   - Clicks textarea to expand
   - Types note: "Need to practice knee grip first"
   - Observes character counter updating (35/2000)
   - Waits 2 seconds (autosave debounce)
   - Sees "Saving..." indicator briefly
   - Sees "Saved" indicator (success)

8. **View My Moves**: Wants to see all tracked moves
   - Clicks "My Moves" in navigation
   - Navigates to My Moves (/my-moves)
   - Sees the move just added with status badge "Want" and note indicator icon
   - Empty state message for other tabs (if no other moves yet)

**Journey Duration**: ~3-5 minutes for engaged new user

**Pain Points Addressed**:

- Overwhelming catalog → Filters and search for easy discovery
- Unclear how to start → Onboarding tour provides context
- Fear of losing data → Autosave with clear feedback
- Forgetting what to practice → My Moves dashboard centralizes tracked moves

### 3.2. Returning User Journey

**Goal**: Check tracked moves, update progress, add notes, discover new moves

**Step-by-Step Flow**:

1. **Sign In**: User navigates to site, clicks "Sign In" from landing or directly visits /auth/sign-in
   - Enters credentials or uses Google OAuth
   - Redirected to Catalog or last-visited page

2. **Check Progress**: Navigates to My Moves (/my-moves)
   - Views all tracked moves with current status
   - Filters by level if desired (tabs)
   - Identifies moves to update

3. **Update Status**: Sees a move marked "Almost" that they've now mastered
   - Clicks status dropdown on card (inline action)
   - Selects "Done" (Zrobione)
   - Optimistic update with toast confirmation
   - Status badge updates immediately

4. **Edit Note**: Clicks move card or note indicator icon
   - Navigates to Move Detail (/moves/[slug])
   - Expands note textarea (pre-populated with existing note)
   - Adds additional thoughts: "Finally got it! Need to work on pointed toes next time."
   - Autosave triggers after 2 seconds
   - Sees "Saved" indicator

5. **Discover New Moves**: Returns to Catalog (/catalog)
   - Searches for new move type (e.g., "invert")
   - Views results
   - Clicks on move to learn more
   - Marks as "Want" to add to My Moves

6. **Sign Out**: Clicks user avatar dropdown in navigation, selects "Sign Out"
   - Session cleared, redirected to Landing Page

**Journey Duration**: ~2-4 minutes per session

### 3.3. Admin Journey

**Goal**: Create a new move, upload reference image, generate AI image, and publish

**Step-by-Step Flow**:

1. **Admin Access**: Admin user signs in and navigates to Admin Dashboard (/admin)
   - Views summary statistics
   - Clicks "Create New Move"

2. **Create Move**: Navigates to Create Move (/admin/moves/new)
   - Enters move name: "Butterfly"
   - Writes description (10-500 characters)
   - Selects level: "Intermediate"
   - Adds steps (minimum 2):
     - Step 1: Title "Starting Position", Description "Begin in a seated position..."
     - Step 2: Title "Leg Extension", Description "Extend legs outward..."
     - Step 3: Title "Balance", Description "Hold the position..."
   - Clicks "Add Step" to add more as needed
   - Clicks "Save as Draft"
   - Move created, slug auto-generated: "butterfly"
   - Redirected to Edit Move page

3. **Add Image**: In Edit Move (/admin/moves/[id]/edit)
   - Scrolls to Image Management Section
   - Drags reference image file (JPG) into upload zone OR clicks to browse
   - File validates (type, size)
   - Preview of reference image displays
   - "Generate AI Image" button becomes enabled
   - Clicks "Generate AI Image"

4. **AI Generation**: Loading state
   - Spinner appears with message "Generating image..."
   - Progress indication (optional)
   - After ~10-30 seconds, AI-generated image appears

5. **Review and Accept**: Side-by-side comparison
   - Reference image on left, AI-generated image on right
   - Reviews quality
   - If satisfied: clicks "Accept"
     - AI image stored publicly and associated with move
     - Workflow closes
   - If not satisfied: clicks "Regenerate" (counter shows attempt 2/5)
     - New AI generation cycle begins
   - Can click "Cancel" to exit workflow without saving

6. **Publish Move**: Scrolls to bottom of form
   - Clicks "Publish" button
   - Confirmation dialog (optional): "Are you sure you want to publish this move?"
   - Confirms
   - Move published (published_at timestamp set)
   - Move now visible in public catalog
   - Toast notification: "Move published successfully!"

7. **Manage Moves**: Returns to Admin Move List (/admin/moves)
   - Views all moves with status indicators
   - Filters by level or status as needed
   - Can edit, unpublish, or soft-delete moves from list
   - Soft delete sets deleted_at, hides from catalog, shows 410 for public users

**Journey Duration**: ~5-10 minutes per move creation

## 4. Layout and Navigation Structure

### 4.1. Global Layout Structure

**Root Layout (`__root.tsx`)**:

- **Header**: Navigation component (Nav)
- **Main**: Route-specific content
- **Footer**: Site links and legal information (Footer)
- **Toast Container**: Sonner toast notifications
- **Error Boundary**: Catch-all for critical errors

### 4.2. Navigation Component (Nav)

**Mobile Navigation (<768px)**:

- **Top Bar**:
  - Logo (left, link to /)
  - Hamburger menu icon (right)
- **Collapsible Drawer** (triggered by hamburger):
  - Public Links (always visible):
    - Home/Landing (/)
    - Browse Catalog (/catalog)
  - Authenticated Links (visible when signed in):
    - My Moves (/my-moves)
    - Account (/account)
    - Sign Out
  - Admin Link (visible for admins):
    - Admin (/admin)
  - Unauthenticated Links (visible when not signed in):
    - Sign In (/auth/sign-in)
    - Sign Up (/auth/sign-up)

**Desktop Navigation (≥768px)**:

- **Horizontal Bar**:
  - Logo (left, link to /)
  - Primary Links (center/left):
    - Browse / Catalog (/catalog)
  - Secondary Links (right):
    - Authenticated users:
      - My Moves (/my-moves)
      - User avatar dropdown:
        - Account (/account)
        - Restart Tour (if applicable)
        - Sign Out
      - Admin badge/link (if admin): Admin (/admin)
    - Unauthenticated users:
      - Sign In button (/auth/sign-in)
      - Sign Up button (primary styled) (/auth/sign-up)

**Navigation State Management**:

- Active route highlighted via URL matching
- Authentication state provided by Supabase Auth context
- Admin role checked from user profile

### 4.3. Mobile-Specific Interactions

**Sticky Bottom Bar** (on Move Detail page for mobile):

- Fixed to bottom of viewport
- Contains primary actions:
  - Status dropdown (left side)
  - Add/Edit Note button (right side)
- Appears only on move detail pages for authenticated users
- Disappears on scroll up (optional enhancement for more screen space)

**Floating Action Button** (on My Moves page for mobile):

- Fixed to bottom-right of viewport
- Prominent "+" button
- Links to Catalog (/catalog)
- Provides quick access to add more moves

### 4.4. Breadcrumb Navigation

**Context-Aware Breadcrumbs**:

- Move Detail page: Catalog > [Move Name]
- Admin Edit page: Admin > Moves > Edit [Move Name]
- Clickable links for each level except current page

### 4.5. Footer Component

**Layout**:

- Responsive multi-column layout
- Column 1: About/description
- Column 2: Links (Browse, My Moves, Admin for admins)
- Column 3: Legal (Privacy Policy, Terms of Service, Contact)
- Bottom: Copyright and social links (optional)

**Visibility**:

- Present on all pages except authentication flows and admin pages (optional exclusion)

## 5. Key Components

### 5.1. Move Card Variants

**Base Component**: `MoveCard`
**Purpose**: Display move summary with context-specific enhancements
**Props**: `move`, `variant` ("catalog" | "myMoves" | "admin")

**Catalog Variant**:

- Move image (aspect ratio 4:3)
- Move name (heading)
- Level badge (color-coded: Beginner=green, Intermediate=yellow, Advanced=red)
- For authenticated users: subtle status badge overlay (optional)
- Click/tap navigates to Move Detail

**My Moves Variant**:

- All Catalog variant content plus:
- Status badge prominent (Want/Almost/Done in Polish)
- Note indicator icon (if note exists)
- Quick status change dropdown (inline)
- Deleted/archived label if soft-deleted (muted styling)

**Admin Variant**:

- Move name (heading, link to edit)
- Level badge
- Status badge (Published/Unpublished/Deleted)
- Last updated date
- Action buttons row: Edit, Publish/Unpublish, Delete

### 5.2. Status Management Components

**StatusDropdown Component**:

- **Purpose**: Allow users to select or change move status
- **Options**: Want (Chcę zrobić), Almost (Prawie), Done (Zrobione)
- **Interaction**: Click/tap to open dropdown, select option, auto-close
- **Optimistic Update**: Immediate UI change, API call in background, rollback on error
- **Notification**: Toast message on success/failure

**StatusBadge Component**:

- **Purpose**: Display current status as a badge
- **Variants**: Color-coded (Want=blue, Almost=orange, Done=green)
- **Location**: Move cards, move detail header

### 5.3. Note Editor Component

**Component**: `NoteEditor`
**Purpose**: Enable users to write and autosave private notes for a move

**Key Features**:

- Expandable textarea (initially collapsed or single-line)
- Character counter (0/2000) updated in real-time
- Save status indicator (Saved/Saving.../Failed)
- Debounce logic (2 seconds after last keystroke)
- Optimistic update pattern
- Retry logic with exponential backoff (3 attempts)
- localStorage backup on persistent failure
- Restore prompt on next load if backup is newer than server version

**Visual States**:

- Idle: Textarea with placeholder "Add a note..."
- Focused: Expanded textarea, character counter visible
- Saving: Spinner icon with "Saving..." text
- Saved: Checkmark icon with "Saved" text (fades after 2 seconds)
- Failed: Warning icon with "Failed to save" and "Retry" or "Save to device" buttons

### 5.4. Search and Filter Components

**SearchBar Component**:

- **Purpose**: Full-text search across move names and descriptions
- **Features**:
  - Full-width input with search icon (left)
  - Clear button (right, visible when input has value)
  - Debounced input (250ms)
  - Loading indicator during search
  - Accessible label and placeholder

**LevelFilterBadges Component**:

- **Purpose**: Filter moves by difficulty level
- **Options**: All, Beginner, Intermediate, Advanced
- **Interaction**: Clickable badges, active badge highlighted
- **State**: Active filter persists in URL query parameter

### 5.5. Loading States

**SkeletonCard Component**:

- **Purpose**: Placeholder for move cards during loading
- **Design**: Gray animated rectangles mimicking card structure
- **Usage**: Display 3-5 skeleton cards while loading move list

**Spinner Component**:

- **Purpose**: Loading indicator for detail views and inline mutations
- **Variants**: Small (inline), Medium (buttons), Large (page center)

### 5.6. Empty States

**EmptyState Component**:

- **Purpose**: User-friendly message when no data to display
- **Elements**:
  - Illustrative icon or image
  - Heading (e.g., "No moves yet")
  - Description (e.g., "Browse the catalog to find moves and track your progress")
  - CTA button (e.g., "Browse Catalog")
- **Usage**: My Moves (no tracked moves), Catalog (no search results), Admin Move List (no moves)

### 5.7. Error Handling Components

**Toast Notifications (Sonner)**:

- **Purpose**: Non-blocking feedback for mutations and actions
- **Variants**: Success (green), Error (red), Info (blue), Warning (orange)
- **Auto-dismiss**: Success after 3 seconds, errors persist with close button
- **Accessibility**: Announced to screen readers via aria-live

**Alert Component (Shadcn)**:

- **Purpose**: Inline error or warning messages
- **Variants**: Error, Warning, Info, Success
- **Usage**: Form validation errors, API query errors, warning messages

**ErrorBoundary Component**:

- **Purpose**: Catch unhandled React errors and display fallback UI
- **Elements**: Error message, "Reload Page" button, "Go Home" link
- **Usage**: Wraps entire application at root level

### 5.8. Admin-Specific Components

**ImageUploader Component**:

- **Purpose**: Drag-and-drop and click-to-browse file upload
- **Features**:
  - Visual drop zone with dashed border
  - File type validation (JPG, PNG)
  - File size validation (max 5MB)
  - Preview of uploaded image
  - Remove/replace option
- **Accessibility**: File input with keyboard access, clear labels

**ImagePreviewComparison Component**:

- **Purpose**: Side-by-side display of reference and AI-generated images
- **Layout**: Two equal-width columns, responsive (stacked on mobile)
- **Labels**: "Reference Image" and "AI-Generated Image"

**AIGenerationControls Component**:

- **Purpose**: Manage AI image generation workflow
- **Buttons**:
  - "Generate AI Image" (primary, enabled after reference upload)
  - "Accept" (success, enabled after AI generation)
  - "Regenerate (X/5)" (secondary, enabled after AI generation, shows attempt counter)
  - "Cancel" (ghost/outline)
- **States**: Idle, Loading (spinner), Preview, Accepted

### 5.9. Onboarding Components

**OnboardingTour Component**:

- **Purpose**: Guide new users through key features
- **Implementation**: Lightweight tour library (e.g., react-joyride) or custom overlay
- **Steps**:
  1. Welcome modal (centered, full-screen overlay)
  2. Catalog tooltip (positioned near catalog link)
- **Controls**: Next, Skip Tour, Got it
- **Persistence**: Dismissal state stored in localStorage and/or user profile
- **Accessibility**: Keyboard-navigable, Escape key dismissal, focus-trapped

### 5.10. Form Components (Shadcn-based)

**Input Component**:

- **Purpose**: Text input with label, validation, and error display
- **Features**: Controlled component, real-time validation, character counter (optional)

**Textarea Component**:

- **Purpose**: Multi-line text input for descriptions and notes
- **Features**: Auto-resize (optional), character counter, validation

**Select Component**:

- **Purpose**: Dropdown selection (e.g., difficulty level)
- **Features**: Keyboard-navigable, accessible labels

**Button Component**:

- **Variants**: Primary, Secondary, Outline, Ghost, Destructive
- **States**: Default, Hover, Focus, Active, Disabled, Loading
- **Accessibility**: Type attribute specified, clear labels

**Dialog Component**:

- **Purpose**: Modal overlays for confirmations and forms
- **Features**: Focus trap, backdrop click to close (optional), Escape key close, accessible

**Drawer Component**:

- **Purpose**: Slide-out panel for mobile navigation
- **Features**: Swipe to close (optional), focus trap, accessible

### 5.11. Badge Component

**Purpose**: Display status, level, and other categorical information
**Variants**: Level (Beginner/Intermediate/Advanced), Status (Want/Almost/Done, Published/Unpublished/Deleted)
**Styling**: Color-coded, rounded corners, small text, inline-block

## 6. Cross-View Patterns and Consistency

### 6.1. Loading States

- **List Views**: 3-5 skeleton cards
- **Detail Views**: Spinner centered with optional "Loading..." text
- **Mutations**: Inline spinner in button or near action
- **Search/Filter**: Subtle loading indicator near search input or filter controls

### 6.2. Error States

- **Form Errors**: Inline below field with red text and icon
- **API Query Errors**: Alert component above content with retry button
- **Mutation Errors**: Toast notification with error message
- **Critical Errors**: Full-page error boundary

### 6.3. Empty States

- **No Search Results**: "No moves found. Try different filters or search terms."
- **No Tracked Moves**: "You haven't tracked any moves yet. Browse the catalog to get started!"
- **No Admin Moves**: "No moves match your filters. Try adjusting filters or create a new move."

### 6.4. Accessibility Patterns

- **Focus Indicators**: Visible outline on all focusable elements
- **Skip Links**: "Skip to main content" link at top of page
- **Semantic HTML**: Proper heading hierarchy, nav, main, article elements
- **ARIA Labels**: Descriptive labels for icons-only buttons and complex interactions
- **Keyboard Navigation**: All interactive elements keyboard-accessible, logical tab order
- **Screen Reader Announcements**: Live regions for dynamic content (toast notifications, autosave status)

### 6.5. Security Patterns

- **Authentication Guards**: Protected routes redirect to sign-in if unauthenticated
- **Authorization Guards**: Admin routes return 403 for non-admins
- **RLS Enforcement**: All user data queries filtered by authenticated user via Supabase RLS
- **Input Validation**: Client-side validation for UX, server-side validation for security
- **Sensitive Data Protection**: Notes never exposed in public APIs, stored encrypted at rest

## 7. User Story to UI Element Mapping

### Authentication and Security

- **US-AUTH-001 (Register with email/password)**: Sign Up view with email/password form, validation, Google OAuth button
- **US-AUTH-002 (Sign in with email/password)**: Sign In view with email/password form, error handling
- **US-AUTH-003 (Sign in with Google)**: GoogleAuthButton component on Sign In and Sign Up views
- **US-AUTH-004 (Password reset)**: Password Reset view with email request form and reset form (via email link)
- **US-AUTH-005 (Sign out)**: Sign out button in navigation dropdown, clears session
- **US-SEC-001 (Protect admin area)**: Admin routes protected by authentication and authorization guards, middleware checks admin role

### Catalog and Discovery

- **US-CAT-001 (Browse catalog)**: Catalog view with paginated move list, move cards
- **US-CAT-002 (Filter by level)**: LevelFilterBadges component with URL persistence
- **US-CAT-003 (Search moves)**: SearchBar component with debounced input, case/diacritics-insensitive matching

### Move Details and Interaction

- **US-MOVE-001 (View move details)**: Move Detail view with complete information, steps list, AI image; 410 Gone for soft-deleted moves

### Status Management

- **US-STATUS-001 (Set status to Want)**: StatusDropdown component on Move Detail and My Moves cards with Want option
- **US-STATUS-002 (Update status to Almost/Done)**: StatusDropdown allows transitions between all statuses with optimistic updates

### Notes

- **US-NOTE-001 (Add/edit private note)**: NoteEditor component with character counter, autosave, accessible only to author
- **US-NOTE-002 (Autosave and offline resilience)**: NoteEditor with debounced save, retry logic, localStorage backup, restore prompt

### Personalization

- **US-MY-001 (View My Moves)**: My Moves view with tabbed filtering, inline status change, note editing, archived move handling

### Onboarding

- **US-ONB-001 (Two-step onboarding)**: OnboardingTour component with welcome modal and catalog tooltip, skip option, localStorage persistence, restart option in Account view

### Admin Functions

- **US-ADMIN-001 (Add new move)**: Create Move view with form validation, steps editor
- **US-ADMIN-002 (Edit move)**: Edit Move view with pre-populated form, step management
- **US-ADMIN-003 (Upload reference image)**: ImageUploader component in Edit Move with file validation
- **US-ADMIN-004 (Generate AI image and accept/regenerate)**: AIGenerationControls and ImagePreviewComparison components with workflow states
- **US-ADMIN-005 (Publish/unpublish/soft delete)**: Action buttons in Admin Move List and Edit Move with confirmation dialogs
- **US-ADMIN-006 (Manage moves list)**: Admin Move List view with filters, search, pagination

## 8. Responsive Design Strategy

### Breakpoints (Tailwind Default)

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1023px (sm to lg)
- **Desktop**: ≥ 1024px (lg+)

### Layout Adaptations

**Mobile (<768px)**:

- Single-column layouts
- Hamburger navigation menu
- Sticky bottom bars for primary actions on detail pages
- Full-width forms and inputs
- Stacked image comparisons in admin

**Tablet (768px - 1023px)**:

- 2-column move card grids
- Horizontal navigation visible (may collapse for smaller tablets)
- Forms remain full-width or slightly constrained

**Desktop (≥1024px)**:

- 3-column move card grids
- Horizontal navigation with dropdowns
- Forms and content max-width centered (e.g., 1200px)
- Side-by-side layouts for comparisons

### Touch Targets

- Minimum 44x44px for all interactive elements on mobile
- Increased spacing between clickable elements
- Thumb-reachable zones prioritized for primary actions

## 9. Performance Considerations

### Optimizations

- **SSR for Public Pages**: Landing and catalog pages server-rendered for fast first paint and SEO
- **Image Optimization**: AI-generated images compressed and served via CDN
- **Lazy Loading**: Images lazy-loaded as user scrolls
- **Code Splitting**: Route-based code splitting via TanStack Start
- **Debounced Inputs**: Search (250ms) and note autosave (2s) debounced to reduce API calls
- **Optimistic Updates**: Immediate UI feedback for mutations, reducing perceived latency
- **Caching**: TanStack Query caches API responses with stale-while-revalidate strategy

### Monitoring

- **Core Web Vitals**: Monitor LCP, FID, CLS for public pages
- **API Performance**: Track query response times and error rates
- **User Metrics**: Track time to first interaction, successful autosaves, error rates

## 10. Future Enhancements (Out of Scope for MVP)

- Dark mode support
- Advanced search (tags, muscle groups, prerequisites)
- Social features (sharing, following, community comments)
- Progress analytics and charts
- Video integration for move demonstrations
- Training session scheduling
- Import/export data
- Native mobile apps (PWA for MVP)
- Multi-language support (architecture ready, Polish for MVP)
- Push notifications
- Wearables integration

---

**Document Version**: 1.0
**Last Updated**: October 12, 2025
**Status**: Final for MVP Implementation
