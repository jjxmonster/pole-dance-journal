# View Implementation Plan: Admin Create Move

## 1. Overview

This document outlines the implementation plan for the "Admin Create Move" view, located at `/admin/moves/new`. This view enables administrators to create a new move through a two-step process. First, they provide the core details (name, description, steps) and save a draft. Second, they proceed to upload a reference image and use an AI service to generate and accept the final move image before publishing.

## 2. View Routing

- **Path**: `/admin/moves/new`
- **Access**: This route must be protected and accessible only to users with an 'admin' role.

## 3. Component Structure

The view will be composed of the following components in a hierarchical structure:

```
/routes/admin/moves/new.tsx (CreateMoveView)
└── MoveForm
    ├── Shadcn.Input (Move Name)
    ├── Shadcn.Textarea (Move Description)
    ├── Shadcn.Select (Move Level)
    ├── StepEditor
    │   ├── StepInputGroup (Rendered for each step)
    │   │   ├── Shadcn.Input (Step Title)
    │   │   ├── Shadcn.Textarea (Step Description)
    │   │   └── Shadcn.Button (Remove Step)
    │   └── Shadcn.Button (Add Step)
    ├── ImageGenerator
    │   ├── Shadcn.Input (type=file for reference image)
    │   ├── Shadcn.Button (Upload)
    │   ├── Shadcn.Image (Preview)
    │   ├── Shadcn.Button (Generate)
    │   └── Shadcn.Button (Accept)
    ├── Shadcn.Button (Save Draft)
    ├── Shadcn.Button (Publish)
    └── Shadcn.Button (Cancel)
```

## 4. Component Details

### `CreateMoveView`

- **Component description**: The main route component that renders the `MoveForm`. It will be responsible for handling the page layout and route-level concerns like access control.
- **Main elements**: A container `div`, a page `header`, and the `<MoveForm />` component.
- **Handled interactions**: None directly; it delegates all form logic to `MoveForm`.
- **Handled validation**: None.
- **Types**: None.
- **Props**: None.

### `MoveForm`

- **Component description**: A client component that orchestrates a multi-step process for creating a move. It first handles the submission of core details, and upon success, enables the `ImageGenerator` component for image management.
- **Main elements**: An HTML `<form>` tag, `Input`, `Textarea`, `Select` for move details, the `StepEditor` component, the `ImageGenerator` component, and `Button` components for submission, publishing, and cancellation.
- **Handled interactions**:
  - Form submission for core details ("Save Draft").
  - Delegating all image-related interactions to the `ImageGenerator` component.
  - Publishing the move after an image has been accepted.
  - Handling input changes for name, description, and level.
  - Handling changes within individual steps, delegated from `StepEditor`.
- **Handled validation**:
  - Checks that the number of steps is between 2 and 15 before submission.
  - Triggers validation for all fields on submit.
  - Displays a loading state on the submit button during the API call.
- **Types**: `MoveFormViewModel`, `CreateMoveDTO`.
- **Props**: None.

### `StepEditor`

- **Component description**: Manages the dynamic list of steps. It is responsible for rendering the `StepInputGroup` for each step and handling the addition, removal, and modification of steps in the list.
- **Main elements**: A `div` that maps over the array of steps to render `StepInputGroup` components. An "Add Step" `Button`.
- **Handled interactions**:
  - `onClick` on the "Add Step" button, which calls a function to add a new step object to the form state.
  - Disables the "Add Step" button when the step count reaches 15.
- **Handled validation**: None directly; validation is handled by child components and the parent `MoveForm`.
- **Types**: `StepViewModel[]`.
- **Props**:
  - `steps: StepViewModel[]`: The array of steps to render.
  - `onAddStep: () => void`: Callback to add a new step.
  - `onRemoveStep: (index: number) => void`: Callback to remove a step at a given index.
  - `onStepChange: (index: number, field: 'title' | 'description', value: string) => void`: Callback to update a step's data.
  - `errors: ZodError | null`: Validation errors related to steps.

### `StepInputGroup`

- **Component description**: Represents a single, editable step within the `StepEditor`. It contains all the UI elements for one step.
- **Main elements**: `Input` for the title, `Textarea` for the description, a `Button` to remove the step, and text elements for character counters.
- **Handled interactions**:
  - `onChange` for title and description inputs, calling the `onStepChange` prop.
  - `onClick` for the "Remove" button, calling the `onRemoveStep` prop.
- **Handled validation**:
  - Displays inline error messages for its title and description fields.
  - Displays real-time character counters.
- **Types**: `StepViewModel`.
- **Props**:
  - `step: StepViewModel`: The step data to display.
  - `index: number`: The index of the step in the array.
  - `onRemove: (index: number) => void`: Callback to remove this step.
  - `onChange: (index: number, field: 'title' | 'description', value: string) => void`: Callback to update this step's data.
  - `error: { title?: string; description?: string } | null`: Specific validation errors for this step.

### `ImageGenerator`

- **Component description**: Handles the complete image workflow: uploading a reference image, triggering AI generation, displaying a preview, and accepting the final image. This component is disabled until the core move details have been saved and a `moveId` is available.
- **Main elements**: A file input component for the reference image, buttons for "Generate Image" and "Accept Image," and an image tag to display the AI-generated preview.
- **Handled interactions**:
  - `onFileSelect` for the reference image.
  - `onClick` to trigger the `uploadReferenceImage` mutation.
  - `onClick` to trigger the `generateImage` mutation.
  - `onClick` to trigger the `acceptImage` mutation.
- **Types**: `UploadReferenceImageDTO`, `GenerateImageDTO`, `AcceptImageDTO`.
- **Props**:
  - `moveId: string`: The ID of the newly created move.
  - `onImageAccepted: (imageUrl: string) => void`: Callback to notify the parent when an image is finalized.
  - `isDisabled: boolean`: Controls if the component is interactive.

## 5. Types

### `CreateMoveDTO`

This DTO matches the `admin.moves.create` oRPC endpoint's input schema. It represents the final, validated data sent to the server.

```typescript
// src/orpc/schema.ts

export const AdminCreateMoveInputSchema = os.object({
	name: os.string().min(3).max(100),
	description: os.string().min(10).max(500),
	level: os.enum(["Beginner", "Intermediate", "Advanced"]),
	steps: os
		.array(
			os.object({
				title: os.string().min(3).max(150),
				description: os.string().min(10).max(150),
			})
		)
		.min(2)
		.max(15),
});

export type CreateMoveDTO = os.infer<typeof AdminCreateMoveInputSchema>;
```

### `AcceptImageDTO`

This DTO will be used for the new `admin.moves.acceptImage` endpoint.

```typescript
export const AdminAcceptImageInputSchema = os.object({
	moveId: os.string(),
	imageUrl: os.string().url(),
});

export type AcceptImageDTO = os.infer<typeof AdminAcceptImageInputSchema>;
```

### `StepViewModel`

Represents a step in the client-side form state. The `id` is crucial for React list rendering.

```typescript
export interface StepViewModel {
	id: string; // Unique client-side ID (e.g., nanoid())
	title: string;
	description: string;
}
```

### `MoveFormViewModel`

Represents the complete form state on the client.

```typescript
export interface MoveFormViewModel {
	name: string;
	description: string;
	level: "Beginner" | "Intermediate" | "Advanced" | ""; // Initial state can be empty
	steps: StepViewModel[];
}
```

## 6. State Management

All form state will be managed within the `MoveForm` component, encapsulated in a custom hook `useMoveForm` to orchestrate the multi-step creation process.

### `useMoveForm` Hook

- **Purpose**: Manages `MoveFormViewModel` state, validation, API mutations, and the overall view flow.
- **Internal State**:
  - `formState: MoveFormViewModel`: The current values of all form fields.
  - `errors: ZodError | null`: Stores validation errors from Zod.
  - `isSubmitting: boolean`: Tracks the submission loading state.
  - `moveId: string | null`: Stores the ID of the move after it's created.
  - `viewStep: 'details' | 'image' | 'published'`: Manages the current step of the view.
  - `referenceImageUrl: string | null`: URL of the uploaded reference image.
  - `aiPreviewUrl: string | null`: URL of the generated AI preview image.
  - `finalImageUrl: string | null`: URL of the accepted final image.
- **Exposed API**:
  - The current state values (`formState`, `errors`, `moveId`, `viewStep`, etc.).
  - State update handlers (`handleInputChange`, `handleStepChange`, `addStep`, `removeStep`).
  - A `handleSubmitDetails` function to trigger the `createMove` mutation.
  - Mutations for all image-related API calls (`uploadReferenceImage`, `generateImage`, `acceptImage`).
  - A mutation for publishing the move.

## 7. API Integration

### Backend (Prerequisite)

The `admin.moves.create` endpoint must be implemented, and a new `admin.moves.acceptImage` endpoint is required.

1.  **Schema (`src/orpc/schema.ts`)**:
    - Define `AdminCreateMoveInputSchema` and `AdminCreateMoveOutputSchema`.
    - Define `AdminAcceptImageInputSchema` and a simple success output schema.
2.  **Data Access (`src/data-access/moves.ts`)**:
    - Create a `createMove` function that uses a Drizzle transaction.
    - Create an `acceptMoveImage(moveId: string, imageUrl: string)` function that updates the `imageUrl` for a given move.
3.  **Router (`src/orpc/router/admin.ts`)**:
    - Implement the `createMoveProcedure`.
    - Implement a new `acceptImageProcedure` protected by admin authentication.

### Frontend

- **API Calls**: Use multiple `useMutation` hooks within the `useMoveForm` hook for each step:
  1.  `createMove`: Creates the move with core details.
  2.  `uploadReferenceImage`: Uploads the reference image file.
  3.  `generateImage`: Generates the AI image from the reference.
  4.  `acceptImage`: Saves the final image URL to the move record.
  5.  `publishMove`: Sets the `publishedAt` timestamp on the move.
- **Request/Response Types**: Will correspond to the DTOs defined in the Types section.

## 8. User Interactions

- **Step 1: Details**: The user fills in the move name, description, level, and steps. Clicking "Save Draft" triggers the `createMove` mutation. On success, the form fields are disabled, and the `ImageGenerator` component is enabled.
- **Step 2: Image Generation**:
  - The user selects a file in the `ImageGenerator` component, which is then uploaded via the `uploadReferenceImage` mutation.
  - Once a reference image is available, the user can click "Generate Image" to call the `generateImage` mutation.
  - A preview of the AI image is displayed.
  - The user clicks "Accept Image", which calls `acceptImage` to associate it with the move.
- **Step 3: Publish**: After an image is accepted, the "Publish" button is enabled. Clicking it calls the `publishMove` mutation and, on success, redirects the user to the admin moves list.

## 9. Conditions and Validation

Client-side validation will be implemented using `zod`, mirroring the `AdminCreateMoveInputSchema`.

- **Name**: Required, 3-100 characters.
- **Description**: Required, 10-500 characters.
- **Level**: Required, must be one of the enum values.
- **Steps (Array)**: Required, must contain between 2 and 15 items.
- **Step Title**: Required, 3-150 characters.
- **Step Description**: Required, 10-150 characters.

Validation messages will be displayed inline below each respective form field when an error is present. The "Save Draft" and "Publish" buttons will be disabled during their respective API calls. The `ImageGenerator` and "Publish" button will be disabled until prerequisite steps are completed.

## 10. Error Handling

- **Client-Side Validation Errors**: On submit, if validation fails, the `errors` state in `useMoveForm` is populated. The UI will render error messages next to the invalid fields. The form submission is prevented.
- **API Errors (e.g., Duplicate Name, Upload Failure)**: The `onError` callback of each `useMutation` hook will be triggered. A toast notification or a form-level `Alert` will display a user-friendly error message.

## 11. Implementation Steps

1.  **Backend Setup**:
    - Add/verify all required schemas in `src/orpc/schema.ts` (`CreateMove`, `AcceptImage`).
    - Implement the `createMove` and `acceptMoveImage` data access functions in `src/data-access/moves.ts`.
    - Implement the `createMoveProcedure` and the new `acceptImageProcedure` in `src/orpc/router/admin.ts`.
2.  **Component Scaffolding**:
    - Create/verify the route file: `/routes/admin/moves/new.tsx`.
    - Create/verify files for `MoveForm.tsx`, `StepEditor.tsx`, and `StepInputGroup.tsx`.
    - Create the new `ImageGenerator.tsx` component file.
3.  **Type Definition**:
    - Define the `StepViewModel` and `MoveFormViewModel` types.
4.  **State Management Hook**:
    - Implement/update the `useMoveForm` custom hook to manage the full multi-step state and API mutations.
5.  **Build UI Components**:
    - Implement the `StepInputGroup` and `StepEditor` components.
    - Implement the new `ImageGenerator` component.
    - Update the `MoveForm` component to manage the view state (`details` vs. `image`) and integrate all child components.
6.  **API Integration**:
    - In `useMoveForm`, set up all required `useMutation` hooks from TanStack Query.
    - Connect the user interaction handlers to trigger the correct mutations.
7.  **Final Touches**:
    - Implement the `CreateMoveView` route component.
    - Add routing and navigation for "Cancel" and success redirects.
    - Add toast notifications for all success and error states.
    - Ensure all accessibility requirements are met across the multi-step flow.
    - Implement the "warn on unsaved changes" browser prompt.
