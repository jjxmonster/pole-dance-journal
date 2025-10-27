# Test Plan for Pole Journal Application

## 1. Introduction and Testing Objectives

### 1.1. Introduction

This document outlines the comprehensive testing strategy for the Pole Journal web application. Pole Journal is a full-stack application designed to help users browse, track, and manage pole dance/fitness moves. The platform features a public catalog, personalized user dashboards, and an administrative panel for content management. This plan details the scope, approach, resources, and schedule for all testing activities.

### 1.2. Testing Objectives

The primary objectives of this testing phase are to:

- **Ensure Functionality:** Verify that all application features, from user authentication to admin content management, function as specified in the requirements.
- **Guarantee Reliability:** Ensure the application is stable, handles errors gracefully, and performs consistently under expected load.
- **Validate Security:** Confirm that user data is secure and that access controls are properly implemented, particularly for the admin section.
- **Verify Usability and Accessibility:** Ensure the application provides a smooth user experience and adheres to accessibility standards.
- **Confirm Integration:** Validate that all parts of the tech stack (frontend, backend API, database, and external services like Supabase) work together seamlessly.
- **Identify and Document Defects:** Find and report bugs in a clear and timely manner to facilitate resolution before deployment.

## 2. Scope of Testing

### 2.1. In-Scope Features

- **User Authentication:**
  - User registration (Sign Up)
  - User login (Sign In) and logout
  - Password recovery (Forgot/Reset Password)
  - OAuth provider integration (if applicable)
  - Session management
- **Public-Facing Features:**
  - Homepage
  - Move Catalog (viewing, searching, filtering, pagination)
  - Individual Move Detail pages
- **Authenticated User Features ("My Moves"):**
  - Viewing a personalized list of moves
  - Updating the status of a move (e.g., "To Do", "In Progress", "Completed")
  - Adding/editing/viewing personal notes for moves
- **Admin Panel:**
  - Secure login for administrators
  - CRUD (Create, Read, Update, Delete) operations for moves
  - Management of move details, steps, and reference images
  - Image generation and upload functionality
- **API (oRPC):**
  - All oRPC endpoints for data retrieval and mutation
  - Input validation and error handling
  - Authentication and authorization middleware

### 2.2. Out-of-Scope Features

- **Third-Party Service Testing:** We will not test the internal workings of Supabase (Auth, Database, Storage). We will only test the application's integration with these services.
- **Underlying Framework/Library Testing:** We assume the stability and correctness of frameworks like Tanstack Start, React, Drizzle, and component libraries like Shadcn/UI. Testing will focus on our implementation using these tools.
- **Formal Performance Load Testing:** While basic performance will be monitored, extensive load and stress testing using tools like k6 or JMeter is out of scope for this initial phase.
- **Database Migration Testing:** The process of running database migrations is not covered. Testing will be performed on a database schema that is already migrated.

## 3. Types of Tests to be Conducted

A multi-layered testing approach will be used to ensure comprehensive coverage.

- **Unit Tests:**
  - **Objective:** To test individual functions and components in isolation.
  - **Scope:** Utility functions (`/lib`, `/utils`), complex React hooks (`/hooks`), and individual UI components (`/components/ui`) with complex logic.
  - **Tools:** Vitest / Jest, React Testing Library.

- **Integration Tests:**
  - **Objective:** To test the interaction between different parts of the application.
  - **Scope:**
    - API (oRPC) Endpoints: Testing each router's procedures for logic, auth, and validation. This is the highest priority for integration tests.
    - Data Access Layer: Testing functions in `/data-access` against a test database to ensure queries are correct.
    - Component Groups: Testing how multiple components work together (e.g., a form with its inputs and submission logic).
  - **Tools:** Vitest / Jest, Supertest (for API), Drizzle test utilities.

- **End-to-End (E2E) Tests:**
  - **Objective:** To simulate real user scenarios from the browser to the database and back.
  - **Scope:** Critical user journeys.
    - User registration and login flow.
    - Searching and filtering the move catalog.
    - A user adding a move to their list, updating its status, and adding a note.
    - An admin creating, updating, and deleting a move.
  - **Tools:** Playwright.

- **Visual Regression Testing:**
  - **Objective:** To catch unintended UI changes.
  - **Scope:** Key pages and components (Homepage, Move Card, Admin Forms).
  - **Tools:** Playwright's screenshot capabilities or a dedicated service like Percy.

- **Accessibility (A11y) Testing:**
  - **Objective:** To ensure the application is usable by people with disabilities.
  - **Scope:** Automated checks will be run on all pages as part of the E2E suite.
  - **Tools:** Playwright with `axe-core`.

## 4. Test Scenarios for Key Functionalities

This is a high-level list of scenarios. Detailed test cases will be created separately.

| Feature            | Scenario ID | Description                                                                            | Priority |
| ------------------ | ----------- | -------------------------------------------------------------------------------------- | -------- |
| **Authentication** | AUTH-01     | A new user can successfully sign up using their email and password.                    | Critical |
|                    | AUTH-02     | A registered user can sign in with correct credentials.                                | Critical |
|                    | AUTH-03     | A user cannot sign in with incorrect credentials and sees a helpful error message.     | Critical |
|                    | AUTH-04     | A user can successfully log out, ending their session.                                 | High     |
|                    | AUTH-05     | A user can request a password reset link and successfully reset their password.        | High     |
| **Move Catalog**   | CAT-01      | A user can view the list of moves in the catalog.                                      | High     |
|                    | CAT-02      | A user can search for a move by name.                                                  | High     |
|                    | CAT-03      | A user can filter moves by category/level and the results update correctly.            | High     |
| **My Moves**       | MYM-01      | An authenticated user can view their personal list of moves.                           | Critical |
|                    | MYM-02      | An authenticated user can change the status of a move and the change is persisted.     | Critical |
|                    | MYM-03      | An authenticated user can add, edit, and view a personal note for a move.              | High     |
|                    | MYM-04      | A guest user is prompted to log in when trying to access the "My Moves" page.          | High     |
| **Admin**          | ADM-01      | An admin user can log in and access the admin dashboard.                               | Critical |
|                    | ADM-02      | A non-admin user is denied access to any `/admin` route.                               | Critical |
|                    | ADM-03      | An admin can create a new move with all required fields, including steps and an image. | Critical |
|                    | ADM-04      | An admin can edit an existing move and the changes are reflected in the catalog.       | High     |
|                    | ADM-05      | An admin can delete a move, and it is removed from the catalog.                        | High     |

## 5. Test Environment

- **CI/CD Environment:** Automated tests (Unit, Integration, E2E) will run via a CI/CD pipeline (e.g., GitHub Actions) on every pull request to the `main` branch.
- **Staging Environment:** A dedicated staging environment that is a mirror of production. It will have its own Supabase project with a separate, seeded database. This environment will be used for manual QA, user acceptance testing (UAT), and running the full E2E suite before a release.
- **Test Database:** The staging database will be seeded with a consistent set of test data (users, moves, statuses) to ensure predictable test outcomes. The database should be reset to a clean state periodically or before each major test run.

## 6. Testing Tools

| Category              | Tool(s)                                   | Purpose                                          |
| --------------------- | ----------------------------------------- | ------------------------------------------------ |
| **Test Runner**       | Vitest / Jest                             | Running unit and integration tests.              |
| **E2E Testing**       | Playwright                                | Automating browser interactions for E2E tests.   |
| **Assertions**        | Vitest/Jest `expect`, Playwright `expect` | Verifying test outcomes.                         |
| **Component Testing** | React Testing Library                     | Rendering and interacting with React components. |
| **Accessibility**     | `axe-core` via Playwright                 | Automated accessibility auditing.                |
| **CI/CD**             | GitHub Actions                            | Automating the execution of the test suite.      |
| **Bug Tracking**      | GitHub Issues                             | Reporting, tracking, and managing defects.       |

## 7. Testing Schedule

This is a tentative schedule and may be adjusted. It assumes a 4-week release cycle.

| Phase                          | Week          | Activities                                                                 |
| ------------------------------ | ------------- | -------------------------------------------------------------------------- |
| **Test Planning & Design**     | 1             | Finalize test plan, write detailed test cases for new features.            |
| **Unit & Integration Testing** | 1-3           | Developers write unit and integration tests alongside feature development. |
| **E2E Test Development**       | 2-3           | QA engineers write new E2E tests for the release candidate.                |
| **Full Regression & UAT**      | 4             | Execute full test suite on Staging, manual exploratory testing, UAT.       |
| **Release**                    | End of Week 4 | Sign-off from QA.                                                          |

## 8. Test Acceptance Criteria

### 8.1. Entry Criteria (Start of Testing Cycle)

- The test plan is approved.
- The Staging environment is stable and deployed with the release candidate build.
- All feature development for the cycle is complete ("code freeze").
- The test database has been seeded.

### 8.2. Exit Criteria (End of Testing Cycle)

- **Test Execution:** 100% of planned test cases have been executed.
- **Pass Rate:** At least 98% of all test cases are in a "Passed" state.
- **Defect Status:**
  - Zero "Critical" or "Blocker" priority bugs are open.
  - All "High" priority bugs are fixed and verified.
  - Any open "Medium" or "Low" priority bugs are documented and approved for deferral by the project manager/product owner.
- **E2E Suite:** The full E2E regression suite passes in the CI/CD pipeline.

## 9. Roles and Responsibilities

| Role                | Responsibilities                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **QA Engineer**     | Develop and maintain the test plan. Create and execute manual and automated E2E tests. Report and verify bugs. Provide final sign-off for release. |
| **Developer**       | Write unit and integration tests for their code. Fix bugs reported by QA. Participate in code reviews to ensure testability.                       |
| **Product Owner**   | Provide requirements and clarify functionalities. Participate in User Acceptance Testing (UAT). Prioritize bug fixes.                              |
| **Project Manager** | Oversee the entire testing process and schedule. Triage bugs and facilitate communication between teams.                                           |

## 10. Bug Reporting Procedures

All defects will be tracked using GitHub Issues.

### 10.1. Bug Report Template

Each bug report must include:

- **Title:** A clear and concise summary of the issue. (e.g., "Admin: Creating a move with a long name breaks the UI layout")
- **Environment:** Where the bug was found (e.g., Staging, Browser/OS version).
- **Steps to Reproduce:** A numbered list of exact steps to trigger the bug.
- **Expected Result:** What should have happened.
- **Actual Result:** What actually happened.
- **Screenshots/Videos:** Visual evidence of the bug is highly encouraged.
- **Priority:** Critical / High / Medium / Low.
- **Labels:** `bug`, and other relevant labels like `ui`, `api`, `auth`.

### 10.2. Defect Lifecycle

1.  **New:** A bug is reported by QA.
2.  **Triaged / To Do:** The bug is confirmed and prioritized by the Project Manager.
3.  **In Progress:** A developer is actively working on a fix.
4.  **In Review / QA:** The fix is deployed to Staging and is ready for verification.
5.  **Done / Closed:** QA verifies the fix, and the issue is closed.
6.  **Rejected / Won't Fix:** The issue is deemed not a bug, a duplicate, or is deferred.
