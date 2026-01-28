# Workbench

## Project Specification Document

---

## Overview

**Name:** Workbench

**Description:**
A personal project incubator for capturing sparks of ideas, nurturing them into fleshed-out concepts, and promoting them to active projects with GitHub integration. Designed for solo developers who want the structure of project management without the ceremony—chaotic, flexible, and pressure-free.

**Tagline:** _Jira, but personal and more chaotic._

---

## Primary User Story

> As a solo developer, I want a single place to capture fleeting ideas, expand them at my own pace, and seamlessly turn them into tracked projects with GitHub repos and tasks, so that my ideas don't get lost and my projects actually make it off my local machine.

---

## Supporting User Stories

| ID    | User Story                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | As a user, I can log in with GitHub so that my identity and repo access are handled in one step.                                          |
| US-02 | As a user, I can create a spark in seconds with just a title so that I capture ideas with zero friction.                                  |
| US-03 | As a user, I can promote a spark to an idea and add a description, notes, and early thinking so that I can develop it without commitment. |
| US-04 | As a user, I can promote an idea to a project with a user story, tech stack, and custom workflow statuses so that I can start building.   |
| US-05 | As a user, I can create a GitHub repo directly from a project so that I stop forgetting to push things.                                   |
| US-06 | As a user, I can link an existing GitHub repo to a project so that I can manage projects I've already started.                            |
| US-07 | As a user, I can add tasks to a project and optionally create a feature branch per task so that my work is organized.                     |
| US-08 | As a user, I can define custom statuses per project so that my workflow fits the project's needs.                                         |
| US-09 | As a user, I can view a dashboard of all sparks, ideas, and projects so that I see everything at a glance.                                |
| US-10 | As a user, I can archive or kill ideas/projects without guilt so that my backlog stays honest.                                            |

---

## Core Concepts

### The Lifecycle

```
💭 Spark ──"flesh out"──→ 💡 Idea ──"let's build"──→ 🔨 Project
                                                          │
                                                      ✅ Tasks + 🔗 Repo
```

### Entity Definitions

**Spark**

- The smallest unit. A fleeting thought.
- Just a title, maybe a one-liner.
- Zero pressure. Capture in under 5 seconds.

**Idea**

- A spark that's been expanded.
- Has a description, notes, early thinking.
- Optional: rough user story, potential tech stack.
- Still no commitment to build.

**Project**

- An idea you've committed to.
- Has: user story, tech stack, description.
- Has: custom workflow statuses.
- Can link to a GitHub repo (existing or newly created).
- Contains tasks.

**Task**

- A unit of work within a project.
- Has a title, description, and status (from project's custom statuses).
- Optionally linked to a Git branch.

---

## Tech Stack

### Core Framework

| Technology      | Purpose                    | Why                                                                 |
| --------------- | -------------------------- | ------------------------------------------------------------------- |
| **Next.js 14+** | Full-stack React framework | App Router, Server Components, API routes, great DX. Learning goal. |
| **TypeScript**  | Type safety                | Learning goal. Catch errors early, better IDE support.              |
| **React 18+**   | UI library                 | Comes with Next.js. Server and client components.                   |

### Database

| Technology      | Purpose             | Why                                                                |
| --------------- | ------------------- | ------------------------------------------------------------------ |
| **Neon**        | Serverless Postgres | Free tier, familiar, scales if needed, serverless fits home cloud. |
| **Drizzle ORM** | Database toolkit    | Type-safe, lightweight, SQL-like syntax, great with TypeScript.    |

### Styling & UI

| Technology       | Purpose           | Why                                                                              |
| ---------------- | ----------------- | -------------------------------------------------------------------------------- |
| **Tailwind CSS** | Utility-first CSS | Fast styling, no context switching, widely adopted.                              |
| **shadcn/ui**    | Component library | Beautiful, accessible, copy-paste components. Not a dependency—you own the code. |
| **Lucide Icons** | Icon set          | Clean, consistent, works great with shadcn/ui.                                   |

### Authentication

| Technology                | Purpose               | Why                                                                  |
| ------------------------- | --------------------- | -------------------------------------------------------------------- |
| **NextAuth.js (Auth.js)** | Authentication        | GitHub OAuth provider built-in, handles sessions, tokens, callbacks. |
| **GitHub OAuth**          | Identity + API access | One login gives you auth AND permission to create repos/branches.    |

### GitHub Integration

| Technology  | Purpose           | Why                                                       |
| ----------- | ----------------- | --------------------------------------------------------- |
| **Octokit** | GitHub API client | Official SDK, TypeScript support, handles auth elegantly. |

### Development & Tooling

| Technology   | Purpose         | Why                                                  |
| ------------ | --------------- | ---------------------------------------------------- |
| **ESLint**   | Linting         | Catch issues, enforce consistency.                   |
| **Prettier** | Formatting      | Consistent code style.                               |
| **pnpm**     | Package manager | Fast, efficient, strict. (Or npm/yarn if preferred.) |

### Hosting

| Technology            | Purpose          | Why                                          |
| --------------------- | ---------------- | -------------------------------------------- |
| **Home Cloud Server** | Self-hosted      | Full control, no costs, always running.      |
| **Docker (optional)** | Containerization | Easier deployment, reproducible environment. |

---

## Data Model

### Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                             User                                │
│  (GitHub OAuth: id, username, email, avatar, access_token)      │
└─────────────────────────────────────────────────────────────────┘
          │
          │ owns
          ▼
┌─────────────────────────────────────────────────────────────────┐
│   Spark                │    Idea                │    Project    │
│   - id                 │    - id                │    - id       │
│   - title              │    - title             │    - title    │
│   - created_at         │    - description       │    - description
│   - user_id            │    - notes             │    - user_story│
│                        │    - user_story?       │    - tech_stack│
│                        │    - tech_stack?       │    - github_repo_url
│                        │    - created_at        │    - github_repo_id
│                        │    - user_id           │    - created_at│
│                        │    - sparked_from?     │    - user_id  │
│                        │                        │    - idea_origin?
└─────────────────────────────────────────────────────────────────┘
                                                          │
                                    ┌─────────────────────┴───────────────────┐
                                    │                                         │
                                    ▼                                         ▼
                         ┌─────────────────────┐               ┌─────────────────────┐
                         │   ProjectStatus     │               │       Task          │
                         │   - id              │               │   - id              │
                         │   - project_id      │               │   - project_id      │
                         │   - name            │               │   - title           │
                         │   - color           │               │   - description     │
                         │   - order           │               │   - status_id       │
                         └─────────────────────┘               │   - branch_name     │
                                                               │   - created_at      │
                                                               └─────────────────────┘
```

### Drizzle Schema (Draft)

```typescript
// schema.ts

import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  githubId: text('github_id').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sparks = pgTable('sparks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

export const ideas = pgTable('ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  sparkOriginId: uuid('spark_origin_id').references(() => sparks.id),
  title: text('title').notNull(),
  description: text('description'),
  notes: text('notes'),
  userStory: text('user_story'),
  techStack: text('tech_stack'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  ideaOriginId: uuid('idea_origin_id').references(() => ideas.id),
  title: text('title').notNull(),
  description: text('description'),
  userStory: text('user_story'),
  techStack: text('tech_stack'),
  githubRepoUrl: text('github_repo_url'),
  githubRepoId: text('github_repo_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

export const projectStatuses = pgTable('project_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id)
    .notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  order: integer('order').notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id)
    .notNull(),
  statusId: uuid('status_id').references(() => projectStatuses.id),
  title: text('title').notNull(),
  description: text('description'),
  branchName: text('branch_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## Application Structure

```
workbench/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing / redirect to dashboard
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts        # NextAuth API route
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard view
│   ├── spark/
│   │   └── [id]/
│   │       └── page.tsx        # Spark detail (minimal)
│   ├── idea/
│   │   └── [id]/
│   │       └── page.tsx        # Idea detail & editing
│   ├── project/
│   │   └── [id]/
│   │       └── page.tsx        # Project view with tasks
│   └── api/
│       ├── sparks/
│       ├── ideas/
│       ├── projects/
│       ├── tasks/
│       └── github/
│           ├── create-repo/
│           └── create-branch/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/
│   ├── spark/
│   ├── idea/
│   ├── project/
│   └── task/
├── lib/
│   ├── db/
│   │   ├── index.ts            # Drizzle client
│   │   └── schema.ts           # Drizzle schema
│   ├── auth.ts                 # NextAuth config
│   ├── github.ts               # Octokit helpers
│   └── utils.ts                # General utilities
├── drizzle/
│   └── migrations/             # Database migrations
├── .env.local                  # Environment variables
├── drizzle.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Implementation Plan

### Phase 1: Foundation

_Get the basics running_

| Task | Description                                     |
| ---- | ----------------------------------------------- |
| 1.1  | Initialize Next.js project with TypeScript      |
| 1.2  | Set up Tailwind CSS                             |
| 1.3  | Install and configure shadcn/ui                 |
| 1.4  | Set up Neon database                            |
| 1.5  | Configure Drizzle ORM and create initial schema |
| 1.6  | Run first migration                             |
| 1.7  | Set up NextAuth with GitHub OAuth               |
| 1.8  | Create basic layout with auth state             |

**Milestone:** User can log in with GitHub and see a blank dashboard.

---

### Phase 2: Sparks

_Capture ideas fast_

| Task | Description                                  |
| ---- | -------------------------------------------- |
| 2.1  | Create Spark API routes (CRUD)               |
| 2.2  | Build quick-capture Spark input on dashboard |
| 2.3  | Display list of Sparks on dashboard          |
| 2.4  | Add archive functionality for Sparks         |

**Milestone:** User can create, view, and archive Sparks.

---

### Phase 3: Ideas

_Flesh out concepts_

| Task | Description                                   |
| ---- | --------------------------------------------- |
| 3.1  | Create Idea API routes (CRUD)                 |
| 3.2  | Build "Promote to Idea" flow from Spark       |
| 3.3  | Create Idea detail/edit page                  |
| 3.4  | Display Ideas on dashboard (separate section) |
| 3.5  | Add archive functionality for Ideas           |

**Milestone:** User can promote Sparks to Ideas and expand on them.

---

### Phase 4: Projects

_Commit to building_

| Task | Description                                    |
| ---- | ---------------------------------------------- |
| 4.1  | Create Project API routes (CRUD)               |
| 4.2  | Build "Promote to Project" flow from Idea      |
| 4.3  | Create Project detail page                     |
| 4.4  | Implement custom status management per project |
| 4.5  | Display Projects on dashboard                  |
| 4.6  | Add archive functionality for Projects         |

**Milestone:** User can promote Ideas to Projects with custom workflows.

---

### Phase 5: GitHub Integration

_Bridge the gap_

| Task | Description                              |
| ---- | ---------------------------------------- |
| 5.1  | Set up Octokit with user's access token  |
| 5.2  | Build "Create Repo" API route            |
| 5.3  | Add "Create Repo" button to Project page |
| 5.4  | Build "Link Existing Repo" functionality |
| 5.5  | Display repo info on Project page        |

**Milestone:** User can create or link GitHub repos from within Workbench.

---

### Phase 6: Tasks & Branches

_Get things done_

| Task | Description                                       |
| ---- | ------------------------------------------------- |
| 6.1  | Create Task API routes (CRUD)                     |
| 6.2  | Build task list UI within Project page            |
| 6.3  | Implement drag-and-drop status changes (optional) |
| 6.4  | Build "Create Branch" API route                   |
| 6.5  | Add "Create Branch" button per task               |
| 6.6  | Display branch info and copy checkout command     |

**Milestone:** User can create tasks, assign statuses, and create branches.

---

### Phase 7: Polish & QoL

_Make it nice_

| Task | Description                                    |
| ---- | ---------------------------------------------- |
| 7.1  | Dashboard filtering/sorting                    |
| 7.2  | Search across sparks/ideas/projects            |
| 7.3  | Keyboard shortcuts (quick capture, navigation) |
| 7.4  | Dark mode                                      |
| 7.5  | Mobile responsiveness                          |
| 7.6  | Loading states and error handling              |

**Milestone:** App feels polished and pleasant to use.

---

### Phase 8: Deployment

_Ship it_

| Task | Description                            |
| ---- | -------------------------------------- |
| 8.1  | Dockerize the application              |
| 8.2  | Set up on home cloud server            |
| 8.3  | Configure environment variables        |
| 8.4  | Set up domain/reverse proxy (optional) |
| 8.5  | Test end-to-end                        |

**Milestone:** Workbench is live and self-hosted.

---

## Project Management

**Tool:** GitHub Projects (Kanban board on the Workbench repo)

**Workflow Statuses:**

- Backlog
- Todo
- In Progress
- Review
- Done

**Labels:**

- `phase-1`, `phase-2`, etc. (for filtering by milestone)
- `bug`, `enhancement`, `docs`

---

## Environment Variables

```env
# Database
DATABASE_URL=postgres://...@neon.tech/workbench

# Auth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXTAUTH_SECRET=random_secret_string
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Open Questions / Future Ideas

- [ ] Should archived items be soft-deleted or moved to a separate view?
- [ ] Add tags/labels to sparks/ideas/projects?
- [ ] Integrate with other Git providers (GitLab, Bitbucket) later?
- [ ] Add a "daily capture" prompt or reminder system?
- [ ] Export/backup functionality?
- [ ] Public sharing of project specs?

---

## Summary

**Workbench** is a personal project incubator built with Next.js, TypeScript, Drizzle, and Neon. It solves the problem of ideas getting lost or never making it to GitHub by providing a low-friction capture system and a clear promotion path from spark → idea → project. GitHub integration removes the friction of repo creation and branch management.

The goal is to learn TypeScript and Next.js while building something genuinely useful.

---

_Document created: January 2026_
_Status: Ready for development_
