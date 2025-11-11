<!-- 2fc37f97-7995-4dae-b64a-5cc4b45dcbba 8403660a-d572-4485-a270-a00710d5bdca -->
# User Settings Page Implementation

## Overview

Build a `/settings` route where authenticated users can update their profile name (text input) and avatar (file upload to Supabase Storage). Use simple React state for form management and TanStack Query for mutations.

## Backend Changes

### 1. Avatar Upload Service (`src/services/avatar-upload.ts`)

Create new service file with:

- `uploadAvatar(file: File, userId: string)` function
- Reuse validation helpers from `src/utils/utils.ts` (`validateFileFormat`, `validateFileSize`)
- Upload to `moves-images` bucket with path: `avatars/{userId}/avatar.jpg`
- Use `upsert: true` to replace existing avatars
- Return public URL (not signed URL, since avatars should be permanent)
- Use `getPublicUrl()` instead of `createSignedUrl()`

Reference the existing pattern in `src/services/image-upload.ts` but adapt for permanent public URLs.

### 2. Update Schemas (`src/orpc/schema.ts`)

Add new schemas after existing profile schemas (~line 642):

```typescript
export const ProfileUploadAvatarInputSchema = z.object({
  file: z.instanceof(File),
});

export const ProfileUploadAvatarOutputSchema = z.object({
  success: z.literal(true),
  avatarUrl: z.string().url(),
  updatedAt: z.date(),
});
```

Also add TypeScript types for exports.

### 3. Update Data Access (`src/data-access/profiles.ts`)

The existing `updateProfileAvatar` function already handles updating the `avatarUrl` field, so no changes needed here.

### 4. Create Upload Procedure (`src/orpc/router/profiles.ts`)

Add new `uploadAvatar` procedure after existing `updateAvatar` (~line 84):

```typescript
export const uploadAvatar = os
  .input(ProfileUploadAvatarInputSchema)
  .output(ProfileUploadAvatarOutputSchema)
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const userId = context.user.id;
    
    try {
      const result = await uploadAvatarToStorage(input.file, userId);
      const profile = await updateProfileAvatar(userId, result.avatarUrl);
      
      return {
        success: true,
        avatarUrl: profile.avatarUrl ?? "",
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to upload avatar.",
      });
    }
  });
```

### 5. Register Procedure (`src/orpc/router/index.ts`)

Import `uploadAvatar` from profiles (~line 33) and add to profiles object (~line 56):

```typescript
profiles: {
  getProfile,
  updateName,
  updateAvatar,
  uploadAvatar,  // Add this
},
```

## Frontend Changes

### 6. Create Settings Route (`src/routes/settings.tsx`)

Create new route file with:

- Auth protection (redirect to `/auth/sign-in` if not authenticated)
- Loader to fetch profile data
- Render `<SettingsPage />` component

Use existing auth patterns from `src/routes/my-moves.tsx` as reference.

### 7. Settings Page Component (`src/components/settings/settings-page.tsx`)

Create main component with:

- Fetch profile using `orpc.profiles.getProfile.query()`
- Two sections: Name and Avatar
- Loading and error states
- Responsive layout using Shadcn Card components

### 8. Name Editor Component (`src/components/settings/name-editor.tsx`)

- Display current name
- Input field with local state
- Validation (2-100 characters, from schema)
- Save button (enabled only when changed and valid)
- Use `useMutation` for `orpc.profiles.updateName.mutate()`
- Show success/error messages
- Disable input while saving

### 9. Avatar Editor Component (`src/components/settings/avatar-editor.tsx`)

- Display current avatar (or placeholder if none)
- File input (accept: image/jpeg, image/png, image/webp)
- Image preview before upload
- Validation: file size (≤10MB), MIME type
- Upload button (enabled when file selected)
- Use `useMutation` for `orpc.profiles.uploadAvatar.mutate()`
- Show upload progress/loading state
- Show success/error messages
- Clear preview after successful upload

### 10. Reusable UI Components

Use existing Shadcn components:

- `Button` from `src/components/ui/button.tsx`
- `Input` from `src/components/ui/input.tsx`
- `Card` from `src/components/ui/card.tsx`
- `Label` from `src/components/ui/label.tsx`
- `Alert` from `src/components/ui/alert.tsx`

### 11. Navigation Link

Consider adding a link to `/settings` in the nav bar (`src/components/nav.tsx`) - check existing patterns for authenticated user menu items.

## Key Implementation Details

- **Validation Constants**: Import from `src/utils/constants.ts` (MAX_FILE_SIZE, ALLOWED_MIME_TYPES)
- **Query Invalidation**: After successful mutations, invalidate `orpc.profiles.getProfile` query
- **Error Handling**: Display user-friendly error messages for upload failures
- **Accessibility**: Use proper labels, ARIA attributes, and semantic HTML
- **File Path**: Avatars stored as `avatars/{userId}/avatar.jpg` in `moves-images` bucket

## Files to Create

- `src/services/avatar-upload.ts`
- `src/routes/settings.tsx`
- `src/components/settings/settings-page.tsx`
- `src/components/settings/name-editor.tsx`
- `src/components/settings/avatar-editor.tsx`

## Files to Modify

- `src/orpc/schema.ts` (add avatar upload schemas)
- `src/orpc/router/profiles.ts` (add uploadAvatar procedure)
- `src/orpc/router/index.ts` (register uploadAvatar)
- `src/components/nav.tsx` (optional: add settings link)

### To-dos

- [ ] Create avatar upload service with Supabase Storage integration
- [ ] Add avatar upload input/output schemas to schema.ts
- [ ] Create uploadAvatar procedure in profiles router
- [ ] Register uploadAvatar procedure in main router index
- [ ] Create settings route with auth protection
- [ ] Create settings page component with profile data fetching
- [ ] Create name editor component with validation and mutation
- [ ] Create avatar editor component with file upload, preview, and mutation