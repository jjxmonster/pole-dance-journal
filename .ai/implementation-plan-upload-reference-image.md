# oRPC Procedure Implementation Plan: admin.moves.uploadReferenceImage

## 1. Procedure Overview

**Purpose**: Enable administrators to upload temporary reference images to Supabase Storage for use in AI image generation workflows. These images are automatically cleaned up after 24 hours if unused, providing a secure and managed way to handle image assets without persistent database entries.

**Scope**:

- Admin-only operation
- Temporary file storage with TTL
- Support for JPEG, PNG, and WebP formats
- Max file size: 10MB
- Auto-expiration: 24 hours

**Status Code**: 201 Created (successful upload returns newly created resource)

---

## 2. Request Details

### HTTP Method

- **POST** (creates a new temporary resource)

### URL Structure

- **Endpoint**: `/api/rpc/admin.moves.uploadReferenceImage`
- **oRPC Procedure**: `admin.moves.uploadReferenceImage`

### Parameters

#### Required Parameters

- **file** (File)
  - Type: File object from FormData or multipart request
  - Constraints: JPEG, PNG, or WebP format only
  - Size limit: 10MB maximum
  - Validation: MIME type verification required

#### Optional Parameters

- **moveId** (string, optional)
  - Type: UUID string
  - Purpose: Associate upload with a specific move for organizational purposes
  - Validation: Must be valid UUID format if provided

### Request Body Structure

```typescript
{
  file: File,           // Required - image file from FormData
  moveId?: string,      // Optional - move UUID for context
}
```

---

## 3. Used Types

### Input Schema (Zod)

```typescript
const uploadReferenceImageSchema = z.object({
	file: z.instanceof(File),
	moveId: z.string().uuid().optional(),
});

type UploadReferenceImageInput = z.infer<typeof uploadReferenceImageSchema>;
```

### Output Schema (Zod)

```typescript
const uploadReferenceImageResponseSchema = z.object({
	referenceImageUrl: z.string().url(),
	uploadedAt: z.date(),
	expiresAt: z.date(),
});

type UploadReferenceImageResponse = z.infer<
	typeof uploadReferenceImageResponseSchema
>;
```

### Error Schema

```typescript
const uploadReferenceImageErrorSchema = z.union([
	z.object({
		code: z.literal("UNAUTHORIZED"),
		message: z.literal("User is not an administrator"),
	}),
	z.object({
		code: z.literal("BAD_REQUEST"),
		message: z.enum([
			"Invalid file format. Only JPEG, PNG, and WebP are supported.",
			"File size exceeds maximum limit of 10MB.",
			"File is required.",
			"Invalid moveId format. Must be a valid UUID.",
		]),
	}),
	z.object({
		code: z.literal("INTERNAL_SERVER_ERROR"),
		message: z.literal("Failed to upload image to storage. Please try again."),
	}),
]);
```

---

## 4. Response Details

### Success Response (201 Created)

```typescript
{
  referenceImageUrl: "https://..../moves-images/temp/[unique-id]/image.jpg",
  uploadedAt: "2025-10-22T14:30:00.000Z",
  expiresAt: "2025-10-23T14:30:00.000Z"   // 24 hours later
}
```

### Error Responses

#### 401 Unauthorized

- **Condition**: User is not an administrator
- **Response Body**: `{ code: "UNAUTHORIZED", message: "User is not an administrator" }`

#### 400 Bad Request

- **Conditions**:
  - Invalid file format (not JPEG, PNG, or WebP)
  - File size exceeds 10MB
  - Missing required file
  - Invalid moveId format (not valid UUID)
- **Response Body**: `{ code: "BAD_REQUEST", message: "[specific error message]" }`

#### 500 Internal Server Error

- **Condition**: Supabase Storage upload fails
- **Response Body**: `{ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload image to storage. Please try again." }`

---

## 5. Data Flow

### Sequence of Operations

1. **Request Reception**
   - Client sends FormData with `file` and optional `moveId`
   - oRPC procedure receives request with FormData

2. **Authentication Check**
   - Extract user context from request
   - Verify user is authenticated (has valid session)
   - Early return 401 if not authenticated

3. **Authorization Check**
   - Retrieve user profile from database
   - Check `isAdmin` flag in profiles table
   - Early return 401 if not admin

4. **Input Validation**
   - Validate file exists and is not null
   - Check MIME type against allowed list (image/jpeg, image/png, image/webp)
   - Verify file size ≤ 10MB
   - Validate moveId format if provided (valid UUID)
   - Return 400 Bad Request if any validation fails

5. **File Preparation**
   - Generate unique storage path: `temp/[userId]-[timestamp]-[random]/[filename]`
   - Prepare file metadata for storage
   - Calculate expiration timestamp (current time + 24 hours)

6. **Storage Upload**
   - Initialize Supabase Storage client
   - Upload file to "moves-images" bucket
   - Handle upload errors with 500 response

7. **URL Generation**
   - Generate public URL from Supabase Storage
   - Construct response with URL, upload timestamp, and expiration time

8. **Cleanup Scheduling** (Optional)
   - Schedule automatic deletion after 24 hours using:
     - Option A: Background job/cron task
     - Option B: Supabase bucket lifecycle policies
     - Option C: Manual cleanup via separate admin procedure

9. **Response Return**
   - Return 201 Created with referenceImageUrl, uploadedAt, and expiresAt

### External Service Interactions

- **Supabase Storage**: File upload and URL generation
- **Supabase Auth**: User context and admin status verification

---

## 6. Security Considerations

### Authentication & Authorization

- **Requirement**: Verify user authentication via Supabase Auth session
- **Authorization**: Enforce admin-only access by checking `profiles.isAdmin` flag
- **Implementation**: Extract user from request context, validate before proceeding

### File Validation

- **MIME Type Checking**: Validate MIME type against whitelist (image/jpeg, image/png, image/webp)
- **Extension Verification**: Verify file extension matches MIME type to prevent spoofing
- **Magic Number Verification** (optional): Check file header bytes for authentic image format
- **Size Enforcement**: Strict 10MB limit to prevent resource exhaustion

### Path Traversal Prevention

- **Sanitized Filenames**: Never use user-provided filenames directly
- **Safe Path Generation**: Use UUID + timestamp + secure random for storage path
- **Storage Isolation**: Keep temp images in dedicated "temp" subdirectory

### Storage Access Control

- **Bucket Policies**: Ensure Supabase Storage bucket policies:
  - Allow authenticated users to read public URLs
  - Restrict direct access to auth-specific operations
  - Prevent directory listing
- **URL Expiration**: Consider implementing signed URLs with time-based expiration

### Data Privacy

- **User Association**: Optional moveId links uploads to specific moves for context
- **Log Management**: Avoid logging sensitive file metadata in production

---

## 7. Error Handling

### Validation Errors (400 Bad Request)

| Error Scenario     | Message                                                        | Handler                               |
| ------------------ | -------------------------------------------------------------- | ------------------------------------- |
| File missing       | "File is required."                                            | Return 400, check file existence      |
| Invalid format     | "Invalid file format. Only JPEG, PNG, and WebP are supported." | Check MIME type against whitelist     |
| Size exceeds limit | "File size exceeds maximum limit of 10MB."                     | Compare file.size to 10 _ 1024 _ 1024 |
| Invalid moveId     | "Invalid moveId format. Must be a valid UUID."                 | Validate with uuid regex or library   |

### Authorization Error (401 Unauthorized)

| Error Scenario    | Message                         | Handler                       |
| ----------------- | ------------------------------- | ----------------------------- |
| Not authenticated | "User is not authenticated."    | Verify session exists         |
| Not admin         | "User is not an administrator." | Check profiles.isAdmin = true |

### Server Errors (500 Internal Server Error)

| Error Scenario         | Message                                                | Handler                                   |
| ---------------------- | ------------------------------------------------------ | ----------------------------------------- |
| Storage upload failure | "Failed to upload image to storage. Please try again." | Log error, retry logic, fallback response |
| Network timeout        | "Failed to upload image to storage. Please try again." | Implement timeout handling                |
| Storage quota exceeded | "Failed to upload image to storage. Please try again." | Monitor storage usage                     |

### Error Handling Pattern

```typescript
// Early return pattern for validation
if (!file) {
	throw new TRPCError({
		code: "BAD_REQUEST",
		message: "File is required.",
	});
}

if (!isAdmin) {
	throw new TRPCError({
		code: "UNAUTHORIZED",
		message: "User is not an administrator.",
	});
}

// Happy path last
// ... upload logic ...
```

### Logging Strategy

- **Success**: Log timestamp, file name, size, user ID (for audit trail)
- **Failures**: Log error type, file metadata, user ID, timestamp
- **Use**: Application logger (console.log in development, structured logging in production)
- **Note**: No database error logging required for temporary operations

---

## 8. Performance Considerations

### Optimization Strategies

1. **File Upload Performance**
   - Stream file upload to Supabase (avoid loading entire file in memory)
   - Use multipart upload for files > 5MB if supported
   - Consider compression before upload (JPEG quality reduction)

2. **Concurrent Uploads**
   - Implement queue management to prevent overwhelming storage service
   - Limit concurrent uploads per user (e.g., max 3 parallel uploads)

3. **Caching**
   - Cache validation results (MIME type checks) for repeated operations
   - Cache user admin status in request context

4. **Database Query Optimization**
   - Admin status check: Single index lookup on `profiles(user_id)`
   - Consider caching admin status in session/JWT if checked frequently

5. **Storage URL Generation**
   - Supabase generates URLs efficiently; no additional optimization needed
   - Use signed URLs only when necessary (adds latency)

### Potential Bottlenecks

- **Network Upload**: File transmission to Supabase Storage
- **Storage Service**: Supabase Storage availability and response time
- **Admin Verification**: Database lookup for isAdmin flag (mitigate with caching)

### Scalability Considerations

- Monitor storage bucket usage and implement cleanup strategies
- Implement request throttling per user to prevent abuse
- Consider CDN caching for generated public URLs

---

## 9. Implementation Steps

### Step 1: Create Image Upload Service

**File**: `src/services/image-upload.ts`

- Create service class with methods for:
  - File validation (type, size, format)
  - Supabase Storage upload
  - Public URL generation
  - Expiration timestamp calculation
- Export validation constants (allowed MIME types, max size)
- Handle all storage operations and errors

### Step 2: Update Type Definitions

**File**: `src/orpc/schema.ts`

- Add Zod schemas for upload input and response
- Define error schema for upload errors
- Export types for use in router and components

### Step 3: Create oRPC Procedure

**File**: `src/orpc/router/admin.ts` (new file or update existing)

- Create procedure handler: `admin.moves.uploadReferenceImage`
- Implement authentication check (verify session exists)
- Implement authorization check (verify isAdmin flag)
- Call image upload service
- Handle errors and map to appropriate status codes
- Return typed response

### Step 4: Register Procedure in Router

**File**: `src/orpc/router/index.ts`

- Import admin router (or procedure)
- Register `admin.moves.uploadReferenceImage` in main router
- Ensure namespace hierarchy: `admin.moves.uploadReferenceImage`

### Step 5: Create Client Hook

**File**: `src/hooks/use-upload-reference-image.ts` (new file, optional)

- Create React Query mutation hook
- Use oRPC client for procedure call
- Handle FormData preparation
- Manage loading/error states
- Return mutation for component integration

### Step 6: Implement Cleanup Strategy

**Option A**: Manual cleanup procedure

- Create `admin.cleanupExpiredReferenceImages` procedure
- Run via scheduled cron job

**Option B**: Supabase bucket lifecycle policy

- Configure bucket to auto-delete objects with `temp/` prefix after 24 hours

**Option C**: TTL metadata tracking

- Store upload metadata with expiration
- Implement background job to delete expired uploads

### Step 7: Create Component/Form (if needed)

**File**: `src/components/admin/upload-reference-image-form.tsx` (optional)

- Create form component for image upload
- Use Shadcn file input component
- Integrate with mutation hook
- Show upload progress and status
- Display returned URL for preview/copy

### Step 8: Add Tests

**File**: `src/orpc/router/__tests__/admin.test.ts` (optional)

- Unit tests for validation logic
- Integration tests with Supabase Storage mock
- Authorization tests (admin vs non-admin)
- Error scenario tests

### Step 9: Update Documentation

**Files**:

- `docs/technical/api/admin-moves-upload-reference-image.md` (new)

- Document API endpoint, parameters, and responses
- Provide usage examples
- Document error codes and handling

### Step 10: Deploy and Monitor

- Deploy to staging environment
- Test with actual Supabase Storage
- Monitor upload success rates
- Verify cleanup processes
- Monitor storage quota usage

---

## 10. Integration Points

### Database Integration

- **Query**: `SELECT is_admin FROM profiles WHERE user_id = ?`
- **Purpose**: Verify admin authorization
- **Performance**: Index on user_id for fast lookup

### Supabase Storage Integration

- **Bucket**: `moves-images`
- **Path Structure**: `temp/[userId]-[timestamp]-[random]/[filename]`
- **Operations**: Upload file, generate public URL
- **Error Handling**: Handle network timeouts and storage errors

### Supabase Auth Integration

- **Context**: Extract user from request context
- **Purpose**: Identify uploading user and verify session
- **Scope**: Admin-only operation
