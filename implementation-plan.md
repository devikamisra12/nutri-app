# AI Nutrition Assistant — Implementation Plan

This document outlines the phase-wise implementation plan for building the AI Nutrition Assistant (Milestone 1). It is based on the requirements detailed in `problem_statement.md` and the system design in `architecture.md`.

## Phase 1: Project Setup & Core Configuration
**Goal:** Initialize the environment, establish the tech stack, and set up database schemas.

- [ ] **1.1 Next.js Initialization:** Scaffold a new Next.js project with React, TypeScript, and standard linting tools.
- [ ] **1.2 Environment Variables:** Set up `.env.local` to securely store the Groq API key and database connection strings.
- [ ] **1.3 Database Setup:** Initialize a local SQLite database for prototyping.
- [ ] **1.4 Schema Definition:** 
  - Create the `Conversation` table (`id`, `created_at`, `updated_at`).
  - Create the `Message` table (`id`, `conversation_id`, `role`, `content`, `structured_response`, `created_at`).
- [ ] **1.5 Type Definitions:** Define TypeScript interfaces and Zod schemas for `Claim` and `AssistantResponse` to ensure strict validation.

## Phase 2: Core Backend Logic & Safety Layer
**Goal:** Build the backend API, integrate the LLM, and enforce safety and schema restrictions.

- [ ] **2.1 API Route Setup:** Scaffold `POST /api/chat` to accept `conversationId` and `message`.
- [ ] **2.2 Scope & Safety Layer:** Implement the backend filter logic to intercept questions about calorie targets, weight targets, and individualized medical advice. Return a structured refusal if triggered.
- [ ] **2.3 Groq API Integration:** Implement the call to the Groq API, configuring it to return structured JSON adhering to the `AssistantResponse` schema.
- [ ] **2.4 Response Validation:** Use Zod to parse and validate the Groq API response. Ensure the `claims` array exists and every `source` is set to `null`.
- [ ] **2.5 Conversation Storage Logic:** Write functions to fetch conversation history, append the user's message, and append the validated assistant response to the database.
- [ ] **2.6 Error Handling:** Implement try/catch blocks to gracefully handle empty messages, Groq API timeouts/failures, and Zod validation errors without exposing stack traces.

## Phase 3: Frontend Development
**Goal:** Build a clean, responsive chat interface that displays structured responses and the empty sources panel.

- [ ] **3.1 Main Layout:** Create the basic UI layout (`Conversation` area on the left/main, `Sources` panel on the right/side).
- [ ] **3.2 Chat Interface:** Build the input area and message history feed.
- [ ] **3.3 Response Rendering:** 
  - Render the assistant's `answer` text clearly.
  - Render the `claims` list in a readable format below the answer.
- [ ] **3.4 Sources Panel:** Implement the empty state component for sources (displaying: *"Sources will appear here when evidence retrieval is enabled."*).
- [ ] **3.5 Frontend API Integration:** Wire the chat UI to the `POST /api/chat` endpoint. Handle loading states, disabled inputs during fetching, and user-facing error toasts.

## Phase 4: Testing & Evaluation
**Goal:** Validate system behavior against safety requirements and log consistency issues.

- [ ] **4.1 Scope Restriction Testing:** Verify that rephrased and indirect questions regarding calories, weight, and medical advice are consistently blocked.
- [ ] **4.2 Evaluation Set Creation:** Create a file (e.g., `evaluation-questions.md`) with the fixed 10 questions covering Nutrient Requirements, Food Safety, Cooking Methods, and Contested Answers.
- [ ] **4.3 Consistency Testing:** Run each evaluation question through the UI multiple times.
- [ ] **4.4 Failure Logging:** Create `failure-log.md`. Document any unsupported claims, inconsistent numbers, or unhandled refusals observed during the consistency testing. **Do not hardcode fixes.**

## Phase 5: Deployment & Documentation
**Goal:** Make the application publicly accessible and wrap up Milestone 1 deliverables.

- [ ] **5.1 Vercel Preparation:** Ensure the project builds successfully (`npm run build`).
- [ ] **5.2 Environment Configuration:** Add Groq API keys and production database configurations to Vercel.
- [ ] **5.3 Deployment:** Deploy the repository to Vercel and verify the live URL works.
- [ ] **5.4 Final Review:** Run through the "Definition of Done" checklist in the problem statement. Include documentation on how to run the project locally.
