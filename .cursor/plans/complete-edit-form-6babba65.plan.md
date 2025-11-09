<!-- 6babba65-500d-44e6-8046-a5ec2c9c6667 e0f30061-aa2c-4ff7-99e9-4ea092f43f81 -->
# Complete Edit Form Multilingual Support

## Overview

The edit form UI and procedures are already multilingual-ready, but the data fetching layer needs to be updated to retrieve both English and Polish translations from the database.

## Changes Required

### 1. Update AdminGetMoveOutputSchema in schema.ts

Update the schema to include multilingual fields for the move and steps:

```typescript
export const AdminGetMoveOutputSchema = z.object({
  move: z.object({
    id: z.string().uuid(),
    name: z.string(),
    descriptionEn: z.string(),
    descriptionPl: z.string(),
    level: z.enum(moveLevelEnum.enumValues),
    slug: z.string(),
    imageUrl: z.string().nullable(),
    steps: z.array(
      z.object({
        orderIndex: z.number().int().positive(),
        titleEn: z.string(),
        titlePl: z.string(),
        descriptionEn: z.string(),
        descriptionPl: z.string(),
      })
    ),
  }),
});
```

**File**: `src/orpc/schema.ts` (lines 561-565)

### 2. Update getMoveByIdForAdmin in data-access/moves.ts

Rewrite the function to fetch both English and Polish translations:

```typescript
export async function getMoveByIdForAdmin(moveId: string) {
  const move = await db.query.moves.findFirst({
    where: and(eq(moves.id, moveId), isNull(moves.deletedAt)),
    columns: {
      id: true,
      name: true,
      level: true,
      slug: true,
      imageUrl: true,
    },
    with: {
      translations: {
        columns: {
          language: true,
          description: true,
        },
      },
      steps: {
        columns: {
          orderIndex: true,
        },
        orderBy: [asc(steps.orderIndex)],
        with: {
          translations: {
            columns: {
              language: true,
              title: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!move) {
    return null;
  }

  const enTranslation = move.translations.find((t) => t.language === "en");
  const plTranslation = move.translations.find((t) => t.language === "pl");

  return {
    id: move.id,
    name: move.name,
    descriptionEn: enTranslation?.description ?? "",
    descriptionPl: plTranslation?.description ?? "",
    level: move.level,
    slug: move.slug,
    imageUrl: move.imageUrl,
    steps: move.steps.map((step) => {
      const enStepTranslation = step.translations.find((t) => t.language === "en");
      const plStepTranslation = step.translations.find((t) => t.language === "pl");
      return {
        orderIndex: step.orderIndex,
        titleEn: enStepTranslation?.title ?? "",
        titlePl: plStepTranslation?.title ?? "",
        descriptionEn: enStepTranslation?.description ?? "",
        descriptionPl: plStepTranslation?.description ?? "",
      };
    }),
  };
}
```

**File**: `src/data-access/moves.ts` (lines 670-694)

### 3. Update InitialMoveData type in use-edit-move-form.ts

Update the type to accept multilingual fields:

```typescript
type InitialMoveData = {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionPl: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  steps: Array<{
    orderIndex: number;
    titleEn: string;
    titlePl: string;
    descriptionEn: string;
    descriptionPl: string;
  }>;
};
```

And update the initialization logic:

```typescript
const [formState, setFormState] = useState<MoveFormViewModel>({
  id: initialData.id,
  name: initialData.name,
  descriptionEn: initialData.descriptionEn,
  descriptionPl: initialData.descriptionPl,
  level: initialData.level,
  steps: sortedSteps.map((step) => ({
    id: crypto.randomUUID(),
    titleEn: step.titleEn,
    titlePl: step.titlePl,
    descriptionEn: step.descriptionEn,
    descriptionPl: step.descriptionPl,
  })),
});
```

**File**: `src/hooks/use-edit-move-form.ts` (lines 53-80)

## Summary

These changes ensure that when an admin edits a move, both English and Polish translations are fetched from the database and properly displayed in the form fields, completing the multilingual editing workflow.