<!-- bac504a9-3a90-42c0-a597-4e2d18999c5e bf7473c3-dd8d-4756-835d-46c28bd2571f -->
# Translation Support Migration Plan

## Overview

Migrate `moves.getBySlug` to use the new translation tables while maintaining backward compatibility through Polish fallback.

## Implementation Steps

### 1. Add Locale to oRPC Context

**File: `src/routes/api.rpc.$.ts`**

Read the `PARAGLIDE_LOCALE` cookie and pass it to oRPC context:

```typescript
import { getCookies } from "@tanstack/react-start/server";

async function handle({ request }: { request: Request }) {
  const supabase = getSupabaseServerClient();
  const cookies = getCookies();
  const locale = (cookies.PARAGLIDE_LOCALE as "en" | "pl") ?? "pl";

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      supabase,
      locale,
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}
```

### 2. Update oRPC Schema

**File: `src/orpc/schema.ts`**

Add optional `translationFallback` field to indicate when Polish fallback is used:

```typescript
export const MoveDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  level: z.enum(moveLevelEnum.enumValues),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  steps: z.array(MoveStepSchema),
  translationFallback: z.boolean().optional(), // true when using Polish fallback
});
```

### 3. Create Translation-Aware Data Access Function

**File: `src/data-access/moves.ts`**

Add new function `getMoveBySlugWithTranslations`:

```typescript
export async function getMoveBySlugWithTranslations(
  slug: string,
  language: "en" | "pl" = "pl"
) {
  const { moveTranslations, stepTranslations } = await import("../db/schema");
  
  // Try to find move translation for requested language
  let moveTranslation = await db.query.moveTranslations.findFirst({
    where: and(
      eq(sql`lower(${moveTranslations.slug})`, slug.toLowerCase()),
      eq(moveTranslations.language, language)
    ),
    with: {
      move: {
        where: and(
          isNotNull(moves.publishedAt),
          isNull(moves.deletedAt)
        ),
        columns: {
          id: true,
          imageUrl: true,
        },
        with: {
          steps: {
            columns: {
              id: true,
              orderIndex: true,
            },
            orderBy: [asc(steps.orderIndex)],
            with: {
              translations: {
                where: eq(stepTranslations.language, language),
                columns: {
                  title: true,
                  description: true,
                },
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  let usedFallback = false;

  // Fallback to Polish if translation not found
  if (!moveTranslation && language !== "pl") {
    moveTranslation = await db.query.moveTranslations.findFirst({
      where: and(
        eq(sql`lower(${moveTranslations.slug})`, slug.toLowerCase()),
        eq(moveTranslations.language, "pl")
      ),
      with: {
        move: {
          where: and(
            isNotNull(moves.publishedAt),
            isNull(moves.deletedAt)
          ),
          columns: {
            id: true,
            imageUrl: true,
          },
          with: {
            steps: {
              columns: {
                id: true,
                orderIndex: true,
              },
              orderBy: [asc(steps.orderIndex)],
              with: {
                translations: {
                  where: eq(stepTranslations.language, "pl"),
                  columns: {
                    title: true,
                    description: true,
                  },
                  limit: 1,
                },
              },
            },
          },
        },
      },
    });
    usedFallback = true;
  }

  if (!moveTranslation?.move) {
    return null;
  }

  const { move } = moveTranslation;

  // Map steps with translations, using fallback if step translation missing
  const stepsWithTranslations = move.steps.map((step) => {
    const translation = step.translations[0];
    return {
      orderIndex: step.orderIndex,
      title: translation?.title ?? "",
      description: translation?.description ?? "",
    };
  });

  return {
    id: move.id,
    name: moveTranslation.name,
    description: moveTranslation.description,
    level: moveTranslation.level,
    slug: moveTranslation.slug,
    imageUrl: move.imageUrl,
    steps: stepsWithTranslations,
    translationFallback: usedFallback,
  };
}
```

### 4. Update oRPC Procedure

**File: `src/orpc/router/moves.ts`**

Modify `getBySlug` to use translations and access locale from context:

```typescript
export const getBySlug = os
  .input(MoveGetBySlugInputSchema)
  .output(MoveGetBySlugOutputSchema)
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const locale = context.locale ?? "pl";
    const move = await getMoveBySlugWithTranslations(input.slug, locale);
    
    if (!move) {
      throw new ORPCError("NOT_FOUND", {
        message: `Move with slug "${input.slug}" not found`,
      });
    }
    
    return move;
  });
```

Update import:

```typescript
import { getMoveBySlugWithTranslations } from "../../data-access/moves";
```

### 5. Display Translation Warning in UI

**File: `src/routes/moves.$slug.tsx`**

Add alert component to show when translation fallback is used:

```typescript
import { Alert, AlertDescription } from "../components/ui/alert";
import { m } from "../paraglide/messages";

function MoveDetailPage() {
  const { move } = Route.useLoaderData();
  
  return (
    <div className="container mx-auto max-w-7xl py-8 xl:px-0">
      <Breadcrumbs moveName={move.name} />
      
      {move.translationFallback && (
        <Alert className="mb-4">
          <AlertDescription>
            {m.translation_in_progress()}
          </AlertDescription>
        </Alert>
      )}
      
      {/* rest of the component */}
    </div>
  );
}
```

### 6. Add Paraglide Message

Add translation message to Paraglide message files for the fallback warning.

## Testing Checklist

- [ ] Test with Polish locale (should use "pl" translations, no fallback)
- [ ] Test with English locale when EN translation exists
- [ ] Test with English locale when EN translation missing (should fallback to PL)
- [ ] Verify fallback flag is set correctly
- [ ] Verify UI shows translation warning when appropriate
- [ ] Test that unpublished/deleted moves still return NOT_FOUND
- [ ] Verify case-insensitive slug matching still works

## Migration Notes

- The `moves` table fields (name, description, level, slug) are still present but will be deprecated
- All data has been migrated to "pl" translations via existing migration script
- English translations can be added progressively without breaking existing functionality
- No frontend changes required beyond displaying the fallback warning

### To-dos

- [ ] Add locale from PARAGLIDE_LOCALE cookie to oRPC context in api.rpc.$.ts
- [ ] Add translationFallback field to MoveDetailSchema in orpc/schema.ts
- [ ] Create getMoveBySlugWithTranslations function in data-access/moves.ts with fallback logic
- [ ] Modify getBySlug procedure to use translations and locale from context
- [ ] Add Alert component to moves.$slug.tsx to display translation fallback message
- [ ] Add translation_in_progress message to Paraglide message files