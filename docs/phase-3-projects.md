# Phase 3: Projects - Complete Implementation Plan

> **Goal:** Full project management with Kanban boards, task management, and GitHub integration.
>
> **Milestone:** User can promote Ideas to Projects with custom workflows, manage tasks on a Kanban board, and seamlessly create/link GitHub repos and branches.

---

## Overview

Phase 3 transforms Workbench from an idea capture tool into a full project management system. This is the largest phase and includes:

- **Project Management** - Full CRUD, project detail pages, dashboard integration
- **Custom Statuses** - User-defined workflow columns per project
- **Task Management** - Tasks, subtasks, descriptions, ordering, drag-and-drop
- **Kanban Board** - Visual task board with status columns
- **GitHub Integration** - Repo creation, repo linking, branch creation per task

---

## Current State (What Exists)

| Component                                   | Status       |
| ------------------------------------------- | ------------ |
| Database schema (projects, statuses, tasks) | ✅ Complete  |
| Project API routes (basic CRUD)             | ✅ Complete  |
| Idea → Project promotion                    | ✅ Complete  |
| GitHub OAuth + access token storage         | ✅ Complete  |
| Status API routes                           | ❌ Not built |
| Task API routes                             | ❌ Not built |
| Project UI (pages, components)              | ❌ Not built |
| Kanban board                                | ❌ Not built |
| GitHub API integration (Octokit)            | ❌ Not built |

---

## Epic 1: Project Foundation

### 1.1 Project Store Setup

**Priority:** P0 - Blocker
**Estimate:** Small

Create Zustand store for projects state management.

**Tasks:**

- [ ] Create `app/store/projects-store.ts`
- [ ] Add projects array state
- [ ] Add `setProjects`, `addProject`, `updateProject`, `removeProject` actions
- [ ] Add `activeProjectId` for current project selection
- [ ] Add computed selectors (getProjectById, getActiveProject)

**Acceptance Criteria:**

- Store follows same pattern as `workbench-store.ts`
- Components can subscribe to project changes without prop drilling
- Deleting/archiving a project updates UI immediately

---

### 1.2 Projects List Page

**Priority:** P0 - Blocker
**Estimate:** Medium

Create the `/projects` page showing all user projects.

**Tasks:**

- [ ] Create `app/projects/page.tsx`
- [ ] Fetch projects on mount using `getActiveProjectsByUserId()`
- [ ] Create `components/projects-list.tsx` - grid/list of project cards
- [ ] Create `components/project-card.tsx` - individual project preview
- [ ] Show project title, description preview, tech stack badges
- [ ] Show task count and completion percentage
- [ ] Show linked GitHub repo indicator
- [ ] Add "New Project" button (creates blank project, not from idea)
- [ ] Add empty state when no projects exist
- [ ] Wire up navigation from navbar

**Acceptance Criteria:**

- User can see all their projects at a glance
- Projects show meaningful preview information
- Can navigate to individual project detail page
- Can create a new blank project

---

### 1.3 Project Detail Page - Shell

**Priority:** P0 - Blocker
**Estimate:** Medium

Create the `/projects/[id]` page structure.

**Tasks:**

- [ ] Create `app/projects/[id]/page.tsx`
- [ ] Fetch project by ID on mount
- [ ] Create page layout with header and content areas
- [ ] Project header with title (editable), description
- [ ] Add breadcrumb navigation (Projects > Project Name)
- [ ] Add project settings dropdown (archive, delete, edit details)
- [ ] Create project metadata sidebar (tech stack, user story, dates)
- [ ] Handle 404 for non-existent projects
- [ ] Add loading skeleton state

**Acceptance Criteria:**

- User can view individual project details
- Project title is editable inline
- Navigation back to projects list works
- Page handles loading and error states gracefully

---

### 1.4 Project Settings Modal

**Priority:** P1 - Important
**Estimate:** Small

Full project editing capabilities.

**Tasks:**

- [ ] Create `components/project-settings-modal.tsx`
- [ ] Edit all project fields (title, description, userStory, techStack)
- [ ] Same field layout as idea detail modal for consistency
- [ ] Archive project functionality
- [ ] Delete project with confirmation
- [ ] Show origin idea link if promoted from idea

**Acceptance Criteria:**

- All project metadata is editable
- Changes save correctly to database
- Archive/delete work with confirmation

---

## Epic 2: Custom Status Management

### 2.1 Status API Routes

**Priority:** P0 - Blocker
**Estimate:** Small

Server actions for project status CRUD.

**Tasks:**

- [ ] Create `app/api/statuses/routes.ts`
- [ ] `createStatus(projectId, name, color, order)` - create new status
- [ ] `getStatusesByProjectId(projectId)` - fetch all statuses for project
- [ ] `updateStatus(statusId, { name?, color?, order? })` - update status
- [ ] `deleteStatus(statusId)` - delete status (handle tasks in this status)
- [ ] `reorderStatuses(projectId, statusIds[])` - bulk update order

**Acceptance Criteria:**

- All CRUD operations work correctly
- Deleting a status sets tasks' statusId to null
- Reordering persists correctly

---

### 2.2 Default Statuses on Project Creation

**Priority:** P0 - Blocker
**Estimate:** Small

Auto-create default workflow when project is created.

**Tasks:**

- [ ] Update `createProject()` to also create default statuses
- [ ] Default statuses: "Backlog", "Todo", "In Progress", "Done"
- [ ] Default colors: gray, blue, yellow, green
- [ ] Order: 0, 1, 2, 3

**Acceptance Criteria:**

- New projects have 4 default statuses immediately
- Promoted ideas also get default statuses
- User can customize after creation

---

### 2.3 Status Management UI

**Priority:** P1 - Important
**Estimate:** Medium

UI for managing project statuses (columns).

**Tasks:**

- [ ] Create `components/status-manager.tsx` - manage statuses panel
- [ ] Add new status with name and color picker
- [ ] Edit existing status (name, color)
- [ ] Delete status with warning about affected tasks
- [ ] Drag to reorder statuses
- [ ] Color picker component (predefined palette + custom)
- [ ] Integrate into project settings or board header

**Acceptance Criteria:**

- User can fully customize their workflow
- Adding/removing statuses updates board immediately
- Reordering statuses reorders board columns

---

## Epic 3: Task Management

### 3.1 Task API Routes

**Priority:** P0 - Blocker
**Estimate:** Medium

Server actions for task CRUD.

**Tasks:**

- [ ] Create `app/api/tasks/routes.ts`
- [ ] `createTask(projectId, title, statusId?, description?)` - create task
- [ ] `getTasksByProjectId(projectId)` - fetch all tasks for project
- [ ] `getTasksByStatusId(statusId)` - fetch tasks in specific status
- [ ] `getTaskById(taskId)` - fetch single task with details
- [ ] `updateTask(taskId, { title?, description?, statusId?, order?, branchName? })`
- [ ] `deleteTask(taskId)` - delete task
- [ ] `moveTask(taskId, newStatusId, newOrder)` - move task between statuses
- [ ] `reorderTasks(statusId, taskIds[])` - bulk update task order within status

**Acceptance Criteria:**

- All CRUD operations work correctly
- Moving tasks updates both status and order
- Tasks maintain order within each status column

---

### 3.2 Task Store Setup

**Priority:** P0 - Blocker
**Estimate:** Small

Zustand store for tasks state management.

**Tasks:**

- [ ] Create `app/store/tasks-store.ts`
- [ ] Add tasks array state (keyed by projectId for efficiency)
- [ ] Add `setTasks`, `addTask`, `updateTask`, `removeTask` actions
- [ ] Add `moveTask` action for drag-and-drop
- [ ] Add selectors: `getTasksByStatus`, `getTaskById`

**Acceptance Criteria:**

- Drag-and-drop updates UI optimistically
- Store syncs with server after moves
- Multiple projects' tasks don't interfere

---

### 3.3 Task Card Component

**Priority:** P0 - Blocker
**Estimate:** Medium

The draggable task card for the Kanban board.

**Tasks:**

- [ ] Create `components/task-card.tsx`
- [ ] Display task title (truncated if long)
- [ ] Display description preview (first line or N chars)
- [ ] Show branch indicator if `branchName` exists
- [ ] Show subtask count and completion (e.g., "2/5")
- [ ] Click to open task detail modal
- [ ] Drag handle for reordering
- [ ] Quick actions menu (edit, delete, move to status)
- [ ] Visual feedback when dragging

**Acceptance Criteria:**

- Cards are visually clean and informative
- Dragging feels smooth with proper feedback
- Quick actions accessible without opening modal

---

### 3.4 Task Detail Modal

**Priority:** P0 - Blocker
**Estimate:** Large

Full task editing in a modal (similar to idea detail modal).

**Tasks:**

- [ ] Create `components/task-detail-modal.tsx`
- [ ] Editable title (large, inline edit)
- [ ] Rich description textarea
- [ ] Status selector dropdown
- [ ] Branch name display with copy button
- [ ] "Create Branch" button (if no branch linked)
- [ ] Subtasks section (see Epic 4)
- [ ] Created/updated timestamps
- [ ] Delete task with confirmation
- [ ] Close with unsaved changes warning
- [ ] Framer Motion animations consistent with idea modal

**Acceptance Criteria:**

- Full task editing capabilities
- Consistent UX with idea detail modal
- Branch integration visible and actionable

---

### 3.5 Quick Add Task

**Priority:** P1 - Important
**Estimate:** Small

Inline task creation within status columns.

**Tasks:**

- [ ] Create `components/quick-add-task.tsx`
- [ ] "+" button at bottom of each column
- [ ] Inline input that appears on click
- [ ] Enter to submit, Escape to cancel
- [ ] Auto-focus when opened
- [ ] Creates task in that status column
- [ ] Keyboard shortcut: `N` when board focused

**Acceptance Criteria:**

- Zero-friction task creation
- Tasks appear immediately in the correct column
- Input clears after creation

---

## Epic 4: Subtasks

### 4.1 Subtask Schema Update

**Priority:** P2 - Nice to Have
**Estimate:** Small

Add subtasks table to database.

**Tasks:**

- [ ] Add `subtasks` table to schema:
  ```typescript
  subtasks {
    id: uuid
    taskId: uuid (FK to tasks, cascade delete)
    title: text
    completed: boolean (default false)
    order: integer
    createdAt: timestamp
  }
  ```
- [ ] Add relations to schema
- [ ] Generate and run migration
- [ ] Export types

**Acceptance Criteria:**

- Subtasks table exists with proper relations
- Deleting a task cascades to subtasks

---

### 4.2 Subtask API Routes

**Priority:** P2 - Nice to Have
**Estimate:** Small

Server actions for subtask CRUD.

**Tasks:**

- [ ] Create `app/api/subtasks/routes.ts`
- [ ] `createSubtask(taskId, title)` - create subtask
- [ ] `getSubtasksByTaskId(taskId)` - fetch subtasks
- [ ] `updateSubtask(subtaskId, { title?, completed?, order? })`
- [ ] `deleteSubtask(subtaskId)` - delete subtask
- [ ] `toggleSubtask(subtaskId)` - toggle completed
- [ ] `reorderSubtasks(taskId, subtaskIds[])` - reorder

**Acceptance Criteria:**

- All CRUD operations work correctly
- Toggle is fast and optimistic

---

### 4.3 Subtask UI in Task Modal

**Priority:** P2 - Nice to Have
**Estimate:** Medium

Subtask management within task detail modal.

**Tasks:**

- [ ] Create `components/subtask-list.tsx`
- [ ] Display subtasks as checklist
- [ ] Checkbox to toggle completion
- [ ] Inline edit subtask title
- [ ] Delete subtask (X button)
- [ ] Add new subtask input at bottom
- [ ] Drag to reorder subtasks
- [ ] Progress indicator (completed/total)
- [ ] Strikethrough completed subtasks

**Acceptance Criteria:**

- Subtasks feel like a simple checklist
- Progress visible at a glance
- Smooth interaction without page reloads

---

## Epic 5: Kanban Board

### 5.1 Kanban Board Component

**Priority:** P0 - Blocker
**Estimate:** Large

The main Kanban board view.

**Tasks:**

- [ ] Create `components/kanban-board.tsx`
- [ ] Horizontal scrolling container for columns
- [ ] One column per status, ordered by status.order
- [ ] Column header shows status name and task count
- [ ] Column body contains task cards
- [ ] Empty column state ("No tasks")
- [ ] Responsive: horizontal scroll on mobile

**Acceptance Criteria:**

- Board displays all statuses as columns
- Tasks appear in correct columns
- Horizontal scroll works smoothly

---

### 5.2 Drag and Drop Implementation

**Priority:** P0 - Blocker
**Estimate:** Large

Implement drag-and-drop for tasks.

**Tasks:**

- [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable`
- [ ] Create `components/kanban-dnd-context.tsx` wrapper
- [ ] Make task cards draggable
- [ ] Make status columns droppable
- [ ] Support reordering within same column
- [ ] Support moving between columns
- [ ] Optimistic UI update on drop
- [ ] Sync to server after drop
- [ ] Rollback on server error
- [ ] Visual feedback during drag (placeholder, drop indicator)
- [ ] Keyboard accessibility for drag operations

**Acceptance Criteria:**

- Drag and drop feels native and smooth
- Tasks can be reordered within columns
- Tasks can be moved between columns
- Server syncs correctly after operations
- Errors don't leave UI in broken state

---

### 5.3 Column Actions

**Priority:** P1 - Important
**Estimate:** Small

Actions available on status columns.

**Tasks:**

- [ ] Column header dropdown menu
- [ ] "Add Task" - opens quick add
- [ ] "Edit Status" - edit name/color
- [ ] "Delete Status" - with task handling warning
- [ ] "Move all tasks to..." - bulk move
- [ ] Column collapse/expand (optional)

**Acceptance Criteria:**

- Common column actions easily accessible
- Destructive actions have confirmations

---

### 5.4 Board Filters and Views

**Priority:** P2 - Nice to Have
**Estimate:** Medium

Filter and view options for the board.

**Tasks:**

- [ ] Search/filter tasks by title
- [ ] Filter by has branch / no branch
- [ ] Toggle: Show archived tasks
- [ ] View toggle: Board / List view
- [ ] Sort tasks within columns (manual, newest, oldest)
- [ ] Persist view preferences to localStorage

**Acceptance Criteria:**

- Users can find tasks quickly
- View preferences persist across sessions

---

## Epic 6: GitHub Integration - Repository Management

### 6.1 Octokit Setup

**Priority:** P0 - Blocker
**Estimate:** Small

Set up GitHub API client.

**Tasks:**

- [ ] Install `octokit` package
- [ ] Create `lib/github.ts` helper module
- [ ] Create `getOctokitClient(accessToken)` function
- [ ] Handle token expiration/refresh gracefully
- [ ] Create typed response interfaces

**Acceptance Criteria:**

- Octokit client can be instantiated with user's token
- API calls work correctly
- Errors are handled gracefully

---

### 6.2 Create Repository API

**Priority:** P0 - Blocker
**Estimate:** Medium

API route to create a new GitHub repository.

**Tasks:**

- [ ] Create `app/api/github/create-repo/route.ts`
- [ ] Accept: repo name, description, private/public
- [ ] Call GitHub API to create repo
- [ ] Return repo URL, name, owner
- [ ] Update project with GitHub repo info
- [ ] Handle errors: name taken, API limits, permissions

**Acceptance Criteria:**

- New repo created on user's GitHub account
- Project linked to repo in database
- Proper error messages for common failures

---

### 6.3 Link Existing Repository API

**Priority:** P0 - Blocker
**Estimate:** Medium

API route to link an existing GitHub repository.

**Tasks:**

- [ ] Create `app/api/github/link-repo/route.ts`
- [ ] Accept: repo owner, repo name (or full URL)
- [ ] Verify repo exists and user has access
- [ ] Fetch repo details from GitHub
- [ ] Update project with GitHub repo info
- [ ] Handle errors: not found, no access

**Acceptance Criteria:**

- User can link any repo they have access to
- Project shows linked repo information
- Proper error handling for access issues

---

### 6.4 Fetch User Repositories API

**Priority:** P1 - Important
**Estimate:** Small

API route to fetch user's GitHub repositories for selection.

**Tasks:**

- [ ] Create `app/api/github/repos/route.ts`
- [ ] Fetch user's repos from GitHub (owned + collaborator)
- [ ] Return list with name, full_name, description, private flag
- [ ] Support pagination for users with many repos
- [ ] Cache results briefly to avoid rate limits

**Acceptance Criteria:**

- User can see list of their repos
- Both owned and collaborator repos appear
- Large repo lists load without issues

---

### 6.5 Repository Linking UI

**Priority:** P0 - Blocker
**Estimate:** Medium

UI for creating or linking GitHub repositories.

**Tasks:**

- [ ] Create `components/github-repo-link.tsx`
- [ ] Show current repo status (linked / not linked)
- [ ] "Create New Repo" button with modal
  - [ ] Repo name input (default from project title)
  - [ ] Description input
  - [ ] Public/Private toggle
  - [ ] Create button with loading state
- [ ] "Link Existing Repo" button with modal
  - [ ] Search/select from user's repos
  - [ ] Or paste repo URL
  - [ ] Link button with loading state
- [ ] Display linked repo info (name, URL, link to GitHub)
- [ ] "Unlink Repo" option

**Acceptance Criteria:**

- Clear UX for both creating and linking repos
- Status clearly visible on project page
- Quick access to GitHub repo from project

---

### 6.6 GitHub Repo Card Component

**Priority:** P1 - Important
**Estimate:** Small

Display component for linked GitHub repo.

**Tasks:**

- [ ] Create `components/github-repo-card.tsx`
- [ ] Show repo name with GitHub icon
- [ ] Link to repo on GitHub (opens new tab)
- [ ] Show public/private badge
- [ ] Show default branch name
- [ ] Show last push date (optional)
- [ ] Quick actions: open in GitHub, unlink

**Acceptance Criteria:**

- Repo info clearly displayed
- Easy access to GitHub
- Consistent styling with app

---

## Epic 7: GitHub Integration - Branch Management

### 7.1 Create Branch API

**Priority:** P0 - Blocker
**Estimate:** Medium

API route to create a new branch for a task.

**Tasks:**

- [ ] Create `app/api/github/create-branch/route.ts`
- [ ] Accept: project ID, task ID, branch name
- [ ] Get project's linked repo info
- [ ] Get default branch SHA from GitHub
- [ ] Create new branch via GitHub API
- [ ] Update task with branchName
- [ ] Handle errors: branch exists, no repo linked, API limits

**Acceptance Criteria:**

- Branch created on GitHub repo
- Task linked to branch in database
- Errors handled with clear messages

---

### 7.2 Branch Name Generation

**Priority:** P1 - Important
**Estimate:** Small

Auto-generate branch names from task titles.

**Tasks:**

- [ ] Create `lib/branch-utils.ts`
- [ ] `generateBranchName(taskTitle, taskId)` function
- [ ] Slugify title (lowercase, hyphens, no special chars)
- [ ] Prefix with task ID or number for uniqueness
- [ ] Example: `feature/42-add-user-authentication`
- [ ] Configurable prefix (feature/, fix/, etc.)
- [ ] Max length handling

**Acceptance Criteria:**

- Branch names are valid git branch names
- Names are unique and descriptive
- User can override generated name

---

### 7.3 Branch UI in Task Detail

**Priority:** P0 - Blocker
**Estimate:** Medium

Branch management within task detail modal.

**Tasks:**

- [ ] Branch section in task detail modal
- [ ] If no branch: "Create Branch" button
  - [ ] Pre-filled branch name (editable)
  - [ ] Branch type selector (feature, fix, chore)
  - [ ] Create with loading state
- [ ] If branch exists:
  - [ ] Display branch name with copy button
  - [ ] "Copy checkout command" button (`git checkout -b ...`)
  - [ ] Link to branch on GitHub
  - [ ] Show branch status (ahead/behind main if possible)
- [ ] Handle repo not linked state

**Acceptance Criteria:**

- Easy branch creation from task
- Quick copy of checkout command
- Clear state when no repo linked

---

### 7.4 Branch Indicator on Task Cards

**Priority:** P1 - Important
**Estimate:** Small

Show branch status on Kanban task cards.

**Tasks:**

- [ ] Add branch icon to task card when branch exists
- [ ] Tooltip showing branch name
- [ ] Click to copy checkout command
- [ ] Different icon if branch has open PR (future)

**Acceptance Criteria:**

- Visual indicator of branch status at a glance
- Quick access to branch info without opening task

---

## Epic 8: Dashboard Integration

### 8.1 Projects Section on Dashboard

**Priority:** P1 - Important
**Estimate:** Medium

Add projects to the main dashboard.

**Tasks:**

- [ ] Update `app/page.tsx` to three-column layout (or tabs)
- [ ] Add projects section alongside sparks and ideas
- [ ] Show recent/active projects (limit 5-6)
- [ ] "View All Projects" link to /projects
- [ ] Project quick preview (title, task progress)
- [ ] Add to workbench store or create projects store

**Acceptance Criteria:**

- Projects visible on main dashboard
- Quick access to recent projects
- Doesn't clutter existing sparks/ideas view

---

### 8.2 Quick Project Access

**Priority:** P2 - Nice to Have
**Estimate:** Small

Fast navigation to projects.

**Tasks:**

- [ ] Add projects to command palette (⌘K)
- [ ] Recent projects in navbar dropdown
- [ ] Keyboard shortcut to switch projects
- [ ] Pin favorite projects

**Acceptance Criteria:**

- Power users can navigate quickly
- Recent projects easily accessible

---

## Epic 9: Polish and UX

### 9.1 Loading States

**Priority:** P1 - Important
**Estimate:** Small

Consistent loading states across project features.

**Tasks:**

- [ ] Skeleton loader for project list
- [ ] Skeleton loader for Kanban board
- [ ] Skeleton loader for task cards
- [ ] Loading spinner for async operations
- [ ] Optimistic updates where possible

**Acceptance Criteria:**

- No jarring loading experiences
- User always knows when something is loading

---

### 9.2 Error Handling

**Priority:** P1 - Important
**Estimate:** Medium

Robust error handling for project features.

**Tasks:**

- [ ] Toast notifications for errors
- [ ] Retry mechanisms for failed operations
- [ ] Graceful degradation when GitHub unavailable
- [ ] Clear error messages for common issues
- [ ] Error boundaries for component crashes

**Acceptance Criteria:**

- Errors don't crash the app
- Users understand what went wrong
- Recovery options when possible

---

### 9.3 Empty States

**Priority:** P1 - Important
**Estimate:** Small

Helpful empty states throughout.

**Tasks:**

- [ ] No projects empty state with CTA
- [ ] No tasks in column empty state
- [ ] No linked repo state with CTA
- [ ] First project onboarding hint

**Acceptance Criteria:**

- Empty states guide user to action
- App doesn't feel broken when empty

---

### 9.4 Keyboard Shortcuts

**Priority:** P2 - Nice to Have
**Estimate:** Small

Keyboard shortcuts for power users.

**Tasks:**

- [ ] `N` - New task in focused column
- [ ] `E` - Edit focused task
- [ ] `Delete/Backspace` - Delete focused task
- [ ] Arrow keys - Navigate between tasks
- [ ] `1-9` - Move task to column 1-9
- [ ] `?` - Show keyboard shortcuts help

**Acceptance Criteria:**

- Power users can work without mouse
- Shortcuts don't conflict with browser

---

### 9.5 Animations and Transitions

**Priority:** P2 - Nice to Have
**Estimate:** Medium

Polish with Framer Motion.

**Tasks:**

- [ ] Page transition animations
- [ ] Card enter/exit animations on board
- [ ] Smooth column reordering
- [ ] Modal enter/exit consistent with existing
- [ ] Subtle hover effects

**Acceptance Criteria:**

- App feels polished and responsive
- Animations don't slow down interactions

---

## Dependencies and Prerequisites

### External Dependencies to Install

```bash
pnpm add octokit @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Database Migrations Required

1. Subtasks table (if implementing subtasks)

### Environment Variables Required

None new - GitHub OAuth already configured with required scopes.

---

## Recommended Implementation Order

### Sprint 1: Foundation (Week 1-2)

1. Project Store Setup (1.1)
2. Projects List Page (1.2)
3. Project Detail Page Shell (1.3)
4. Status API Routes (2.1)
5. Default Statuses on Creation (2.2)
6. Task API Routes (3.1)
7. Task Store Setup (3.2)

### Sprint 2: Kanban Core (Week 3-4)

1. Task Card Component (3.3)
2. Quick Add Task (3.5)
3. Kanban Board Component (5.1)
4. Drag and Drop Implementation (5.2)
5. Task Detail Modal (3.4)

### Sprint 3: GitHub Integration (Week 5-6)

1. Octokit Setup (6.1)
2. Create Repository API (6.2)
3. Link Existing Repository API (6.3)
4. Repository Linking UI (6.5)
5. Create Branch API (7.1)
6. Branch UI in Task Detail (7.3)

### Sprint 4: Polish (Week 7)

1. Status Management UI (2.3)
2. Project Settings Modal (1.4)
3. Loading States (9.1)
4. Error Handling (9.2)
5. Empty States (9.3)
6. Dashboard Integration (8.1)

### Sprint 5: Nice-to-Haves (Week 8+)

1. Subtasks (Epic 4)
2. Board Filters (5.4)
3. Column Actions (5.3)
4. Keyboard Shortcuts (9.4)
5. Animations (9.5)
6. Quick Project Access (8.2)

---

## Success Metrics

- [ ] User can create a project and see it on the board
- [ ] User can create tasks and drag them between statuses
- [ ] User can create a GitHub repo from a project
- [ ] User can link an existing GitHub repo to a project
- [ ] User can create a branch for a task and copy the checkout command
- [ ] Full promotion flow works: Spark → Idea → Project → Tasks
- [ ] No page refreshes needed for common operations

---

## Open Questions

1. **Subtask depth:** Keep to one level (tasks → subtasks) or allow nested subtasks?
   - _Recommendation:_ One level only for simplicity

2. **GitHub sync:** Should we sync GitHub issues to tasks automatically?
   - _Recommendation:_ Phase 4 feature - keep Phase 3 focused on outbound (creating repos/branches)

3. **Collaboration:** Is this single-user only or will we add team features?
   - _Recommendation:_ Single-user for now, design schema to allow future expansion

4. **Offline support:** Should board work offline with sync?
   - _Recommendation:_ Not for Phase 3, consider for Phase 7 polish

---

_Document created: January 2026_
_Phase: 3 of 8_
_Status: Planning_
