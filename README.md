# Spinella

A web application designed for pole dance practitioners to track their learning progress, manage personal notes, and browse a curated catalog of moves.

---

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

---

## Project Description

Pole Journal helps pole dancers track which moves they want to learn, are currently working on, or have mastered. It provides a structured catalog of moves, personalized statuses, and private notes with a reliable autosave feature. The application also includes a secure admin panel for curators to manage the move catalog, including generating illustrative images using AI.

## Tech Stack

The project is built with a modern, type-safe stack:

- **Framework**: [TanStack Start](https://tanstack.com/start)
- **Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching & State**: [TanStack Query](https://tanstack.com/query) & [TanStack Store](https://tanstack.com/store)
- **Forms**: [TanStack Form](https://tanstack.com/form)
- **API**: [oRPC](https://orpc.dev/)
- **Backend & DB**: [Supabase](https://supabase.com/) (Auth, Postgres, Storage)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)

## Getting Started Locally

To run the project locally, follow these steps:

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10 or higher)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/pole-journal.git
    cd pole-journal
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file (if available). You will need to add your Supabase project URL and anon key.

    ```env
    VITE_SUPABASE_URL=your-supabase-project-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

The application should now be running at `http://localhost:3000`.

## Available Scripts

The following scripts are available in the `package.json`:

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server after a build.
- `pnpm serve`: Serves the production build locally for preview.
- `pnpm test`: Runs tests using Vitest.
- `pnpm format`: Formats the code using Biome.
- `pnpm lint`: Lints the code using Biome.
- `pnpm check`: Runs all Biome checks (lint, format, etc.).

## Project Scope

### User-Facing Features

- **Authentication**: Secure sign-up and sign-in with email/password and Google OAuth.
- **Move Catalog**: A public, browsable catalog of pole moves with filtering and search functionality.
- **Move Details**: A detailed view for each move, including description, steps, and an AI-generated image.
- **Status Tracking**: Users can set a personal status for each move (`Want to Learn`, `In Progress`, `Mastered`).
- **Private Notes**: Private, autosaving notes for each move, accessible only to the user.
- **My Moves**: A personalized dashboard showing all moves a user has interacted with.

### Admin Features

- **Secure Admin Area**: A role-protected admin panel for content management.
- **Move Management**: Create, edit, publish, and unpublish moves and their steps.
- **AI Image Generation**: An efficient workflow to generate and accept AI-created images for moves based on reference photos.

### Out of Scope for MVP

- Social features (sharing, comments, following).
- Instructional videos.
- Advanced analytics and progress charts.
- Native mobile applications.

## Project Status

This project is currently **in development**. The immediate focus is on delivering the Minimum Viable Product (MVP) with the core features outlined in the project scope.

## License

This project is currently not licensed.
