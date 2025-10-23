# oRPC Procedure Implementation Plan: admin.moves.generateImage

## 1. Procedure Overview

**Purpose**: Generate AI image previews for moves using flux-schnell model with image-to-image transformation. This procedure allows admins to preview AI-generated images before permanently associating them with moves, enabling iterative refinement through regeneration attempts.

**Key Characteristics**:

- Admin-only access (authorization required)
- Asynchronous AI processing via Replicate API
- Temporary image storage (not yet move-associated)
- Session tracking for regeneration attempts
- Rate limiting per move to prevent API abuse
- 24-hour expiration for temporary preview images

**Status Code**: 201 Created (new preview generated)

---

## 2. Request Details

### HTTP Method & Structure

- **Method**: POST
- **Endpoint**: `admin.moves.generateImage`
- **Authentication**: Required (Bearer token via Supabase Auth)
- **Authorization**: Admin role required

### Request Input Schema

```typescript
{
  moveId: string;                    // UUID of move to generate image for
  prompt: string;                    // AI generation description (10-500 chars)
  referenceImageUrl: string;         // URL from uploadReferenceImage procedure
  sessionId?: string;                // Optional UUID for tracking regeneration
}
```

### Parameter Details

| Parameter           | Type        | Required | Constraints                          | Purpose                              |
| ------------------- | ----------- | -------- | ------------------------------------ | ------------------------------------ |
| `moveId`            | UUID string | ✓        | Must exist in DB, valid UUID format  | Identify target move                 |
| `prompt`            | String      | ✓        | 10-500 chars, non-empty              | AI generation instructions           |
| `referenceImageUrl` | URL string  | ✓        | Valid URL, must be accessible, HTTPS | Source for image-to-image generation |
| `sessionId`         | UUID string | ✗        | Valid UUID format if provided        | Track regeneration attempts          |

---

## 3. Response Details

### Success Response (201 Created)

```typescript
{
	previewUrl: string; // Temporary URL to generated preview (expires in 24h)
	sessionId: string; // UUID for tracking this generation attempt
	generatedAt: Date; // ISO timestamp of generation completion
}
```

### Response Structure Details

| Field         | Type       | Source                      | Lifetime               |
| ------------- | ---------- | --------------------------- | ---------------------- |
| `previewUrl`  | URL string | Supabase Storage signed URL | 24 hours               |
| `sessionId`   | UUID       | Database or generated       | Persisted for tracking |
| `generatedAt` | ISO 8601   | Server timestamp            | Reference only         |

### Error Responses

| HTTP Code | Error Type            | Scenario                     | Message                                                   |
| --------- | --------------------- | ---------------------------- | --------------------------------------------------------- |
| 401       | UNAUTHORIZED          | User not authenticated       | "Authentication required"                                 |
| 401       | UNAUTHORIZED          | User not admin               | "Admin access required"                                   |
| 404       | NOT_FOUND             | Move does not exist          | "Move not found"                                          |
| 400       | BAD_REQUEST           | Invalid moveId format        | "Invalid move ID format"                                  |
| 400       | BAD_REQUEST           | Prompt too short/long        | "Prompt must be 10-500 characters"                        |
| 400       | BAD_REQUEST           | Invalid URL format           | "Invalid reference image URL format"                      |
| 400       | BAD_REQUEST           | Reference URL not accessible | "Reference image not accessible or expired"               |
| 400       | BAD_REQUEST           | Rate limit exceeded          | "Generation limit exceeded for this move (max 5 per 24h)" |
| 500       | INTERNAL_SERVER_ERROR | Replicate API fails          | "Image generation service error"                          |
| 500       | INTERNAL_SERVER_ERROR | Storage operation fails      | "Failed to store preview image"                           |

---

## 4. Used Types

### Input/Output Schemas (oRPC)

```typescript
// In src/orpc/schema.ts

// Input validation schema
export const generateImageInputSchema = z.object({
	moveId: z.string().uuid("Invalid move ID format"),
	prompt: z
		.string()
		.min(10, "Prompt must be at least 10 characters")
		.max(500, "Prompt must not exceed 500 characters"),
	referenceImageUrl: z
		.string()
		.url("Invalid URL format")
		.startsWith("https://", "Must use HTTPS"),
	sessionId: z.string().uuid("Invalid session ID format").optional(),
});

// Output response schema
export const generateImageOutputSchema = z.object({
	previewUrl: z.string().url(),
	sessionId: z.string().uuid(),
	generatedAt: z.date(),
});

export type GenerateImageInput = z.infer<typeof generateImageInputSchema>;
export type GenerateImageOutput = z.infer<typeof generateImageOutputSchema>;
```

### Database Schema Notes

No database schema changes required. Rate limiting and generation tracking are managed via:

- **In-memory cache**: Track recent generations per move in request handler (lightweight)
- **Supabase Storage metadata**: Optional - store session info in object metadata
- **Optional future enhancement**: Add dedicated table if persistent tracking becomes necessary

---

## 5. Data Flow

### High-Level Process Flow

```
1. Request Received
   ↓
2. Authenticate User (verify token)
   ↓
3. Authorize (verify admin role)
   ↓
4. Validate Input (schema validation)
   ↓
5. Check Rate Limit (max 5 generations per move per 24h)
   ↓
6. Verify Move Exists
   ↓
7. Validate Reference Image URL
   ↓
8. Call Replicate API (image-to-image flux-schnell)
   ↓
9. Store Generated Image (Supabase Storage)
   ↓
10. Create Signed URL (24h expiration)
   ↓
11. Return Response (previewUrl, sessionId, generatedAt)
```

### Detailed Data Flow

#### Step 1-3: Authentication & Authorization

- Extract JWT from request headers
- Verify token with Supabase Auth
- Check `profiles.isAdmin = true`
- **Early return** with 401 if fails

#### Step 4: Input Validation

- Validate using Zod schema: `generateImageInputSchema`
- Validate moveId UUID format
- Validate prompt length (10-500)
- Validate referenceImageUrl is valid HTTPS URL
- Validate optional sessionId if provided
- **Early return** with 400 if validation fails

#### Step 5: Verify Move Exists

- Query `moves` table for given moveId
- Ensure `deletedAt IS NULL`
- **Early return** with 404 if not found

#### Step 6: Validate Reference Image

- HTTP HEAD request to referenceImageUrl
- Verify status 200, Content-Type is image/\*
- Verify Content-Length < 50MB (prevent abuse)
- Set timeout 5 seconds
- **Early return** with 400 if invalid/inaccessible

#### Step 7: Call Replicate API

- Initialize Replicate client with REPLICATE_API_TOKEN
- Call `replicate.run("black-forest-labs/flux-schnell", { input })`
- Input object:
  ```javascript
  {
    prompt: prompt,
    image: referenceImageUrl,
    num_outputs: 1,
    num_inference_steps: 4,
    guidance_scale: 7.5
  }
  ```
- Set timeout 120 seconds (flux-schnell is fast, ~30s typical)
- Handle timeout and API errors
- **Early return** with 500 if API fails

#### Step 8: Return Response

```typescript
{
	previewUrl: "replicate_url",
	generatedAt: new Date()
}
```

---

## 6. Security Considerations

### Authentication

- **Requirement**: Valid JWT token from Supabase Auth
- **Implementation**: Verify token expiration, signature, and issuer
- **Error**: Return 401 UNAUTHORIZED if invalid/expired

### Authorization

- **Requirement**: User must have `profiles.isAdmin = true`
- **Implementation**: Query profiles table after authentication
- **Error**: Return 401 UNAUTHORIZED if not admin

### Input Validation

- **moveId**: UUID format validation (prevents SQL injection, invalid references)
- **prompt**: Length constraints (prevents excessively long requests to AI service)
- **referenceImageUrl**:
  - URL format validation (prevents malformed URLs)
  - HTTPS-only (prevents MITM attacks, information leakage)
  - Accessibility validation (prevents referencing internal/private resources)
  - Size limits (prevents abuse via large files)

---

## 7. Error Handling

### Validation Errors (400 Bad Request)

```typescript
// Input validation failures
if (validateMoveIdFails) {
	return {
		success: false,
		error: "Invalid move ID format",
		code: "BAD_REQUEST",
	};
}

if (validatePromptFails) {
	return {
		success: false,
		error: "Prompt must be 10-500 characters",
		code: "BAD_REQUEST",
	};
}

if (validateUrlFails) {
	return {
		success: false,
		error: "Invalid reference image URL format",
		code: "BAD_REQUEST",
	};
}

// Rate limiting
if (recentGenerationCount >= RATE_LIMIT) {
	return {
		success: false,
		error: "Generation limit exceeded for this move (max 5 per 24h)",
		code: "BAD_REQUEST",
	};
}

// Reference image validation
if (referenceImageNotAccessible) {
	return {
		success: false,
		error: "Reference image not accessible or expired",
		code: "BAD_REQUEST",
	};
}
```

### Authorization Errors (401 Unauthorized)

```typescript
if (!isAuthenticated) {
	return {
		success: false,
		error: "Authentication required",
		code: "UNAUTHORIZED",
	};
}

if (!isAdmin) {
	return {
		success: false,
		error: "Admin access required",
		code: "UNAUTHORIZED",
	};
}
```

### Not Found Errors (404 Not Found)

```typescript
if (moveNotFound) {
	return {
		success: false,
		error: "Move not found",
		code: "NOT_FOUND",
	};
}
```

### Server Errors (500 Internal Server Error)

```typescript
try {
	const output = await replicate.run("black-forest-labs/flux-schnell", { input });
} catch (error) {
	logger.error("Replicate API error", { error, moveId, prompt });
	return {
		success: false,
		error: "Image generation service error",
		code: "INTERNAL_SERVER_ERROR",
	};
}

try {
	await uploadToStorage(...);
} catch (error) {
	logger.error("Storage error", { error, moveId, sessionId });
	return {
		success: false,
		error: "Failed to store preview image",
		code: "INTERNAL_SERVER_ERROR",
	};
}
```

### Error Handling Best Practices

- **Early returns**: Check errors at the beginning of function
- **Guard clauses**: Avoid deeply nested if-else statements
- **Descriptive logging**: Log full context server-side for debugging
- **Safe messages**: Return generic user-friendly messages (no internal details)
- **Proper status codes**: Match HTTP semantics (4xx for client errors, 5xx for server)

---

---

## 9. Implementation Steps

### Step 1: Create Image Generation Service

**File**: `src/services/image-generation.ts`

**Responsibilities**:

- Replicate API integration and error handling
- Supabase Storage management (upload, signing URLs)
- Reference image validation (HEAD request, accessibility check)
- Rate limiting logic (count recent generations)

**Key Functions**:

```typescript
export async function validateReferenceImage(url: string): Promise<boolean>;
export async function generateImageWithReplicate(
	prompt: string,
	imageUrl: string
): Promise<string>;
export async function uploadPreviewImage(
	buffer: Buffer,
	moveId: string,
	sessionId: string
): Promise<string>;
export async function createSignedUrl(
	filePath: string,
	expiresIn: number
): Promise<string>;
export async function checkRateLimit(moveId: string): Promise<boolean>;
```

### Step 2: Update oRPC Schema

**File**: `src/orpc/schema.ts`

**Add**:

- Input validation schema: `generateImageInputSchema`
- Output schema: `generateImageOutputSchema`
- Type exports: `GenerateImageInput`, `GenerateImageOutput`
- Validation constants: `PROMPT_MIN_LENGTH`, `PROMPT_MAX_LENGTH`, `RATE_LIMIT_PER_24H`, etc.

### Step 3: Create Admin Router Procedure

**File**: `src/orpc/router/admin.ts`

**Create procedure**:

```typescript
export const generateImageProcedure = adminProcedure
	.input(generateImageInputSchema)
	.output(generateImageOutputSchema)
	.mutation(async ({ input, ctx }) => {
		// 1. Validate input (schema already applied)
		// 2. Check authentication/authorization
		// 3. Verify move exists
		// 4. Check rate limit
		// 5. Validate reference image
		// 6. Call Replicate API
		// 7. Upload to storage
		// 8. Create signed URL
		// 9. Return response
	});
```

**Error Handling**: Implement guard clauses and early returns for each step

### Step 4: Register Procedure in Router

**File**: `src/orpc/router/index.ts`

**Add**:

- Import `generateImageProcedure` from `admin.ts`
- Register in router: `generateImage: generateImageProcedure`

---

## 10. Constants & Configuration

```typescript
// src/utils/constants.ts - Add to existing file

export const IMAGE_GENERATION = {
	PROMPT_MIN_LENGTH: 10,
	PROMPT_MAX_LENGTH: 500,
	RATE_LIMIT_PER_24H: 5,
	REFERENCE_IMAGE_VALIDATION_TIMEOUT_MS: 5000,
	REFERENCE_IMAGE_MAX_SIZE_MB: 50,
	PREVIEW_IMAGE_EXPIRATION_HOURS: 24,
	REPLICATE_TIMEOUT_MS: 120000,
	ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const REPLICATE_MODEL = {
	ID: "black-forest-labs/flux-schnell",
	NUM_OUTPUTS: 1,
	NUM_INFERENCE_STEPS: 4,
	GUIDANCE_SCALE: 7.5,
} as const;
```

---
