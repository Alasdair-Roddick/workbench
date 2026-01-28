import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  githubId: text('github_id').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token'), // For GitHub API calls
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sparks: many(sparks),
  ideas: many(ideas),
  projects: many(projects),
}));

// ============================================================================
// SPARKS
// Fleeting thoughts. Capture in seconds. Zero pressure.
// ============================================================================

export const sparks = pgTable('sparks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

export const sparksRelations = relations(sparks, ({ one, many }) => ({
  user: one(users, {
    fields: [sparks.userId],
    references: [users.id],
  }),
  ideas: many(ideas), // Ideas that originated from this spark
}));

// ============================================================================
// IDEAS
// Expanded sparks. Description, notes, early thinking.
// ============================================================================

export const ideas = pgTable('ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sparkOriginId: uuid('spark_origin_id').references(() => sparks.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  notes: text('notes'),
  userStory: text('user_story'),
  techStack: text('tech_stack'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  user: one(users, {
    fields: [ideas.userId],
    references: [users.id],
  }),
  sparkOrigin: one(sparks, {
    fields: [ideas.sparkOriginId],
    references: [sparks.id],
  }),
  projects: many(projects), // Projects that originated from this idea
}));

// ============================================================================
// PROJECTS
// Committed to building. Has tasks, statuses, GitHub integration.
// ============================================================================

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ideaOriginId: uuid('idea_origin_id').references(() => ideas.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  userStory: text('user_story'),
  techStack: text('tech_stack'),
  githubRepoUrl: text('github_repo_url'),
  githubRepoName: text('github_repo_name'),
  githubRepoOwner: text('github_repo_owner'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  ideaOrigin: one(ideas, {
    fields: [projects.ideaOriginId],
    references: [ideas.id],
  }),
  statuses: many(projectStatuses),
  tasks: many(tasks),
}));

// ============================================================================
// PROJECT STATUSES
// Custom workflow per project. User defines their own.
// ============================================================================

export const projectStatuses = pgTable('project_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6b7280'), // Default gray
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectStatusesRelations = relations(projectStatuses, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectStatuses.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

// ============================================================================
// TASKS
// Units of work within a project. Can have a linked Git branch.
// ============================================================================

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  statusId: uuid('status_id').references(() => projectStatuses.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  branchName: text('branch_name'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  status: one(projectStatuses, {
    fields: [tasks.statusId],
    references: [projectStatuses.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Spark = typeof sparks.$inferSelect;
export type NewSpark = typeof sparks.$inferInsert;

export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectStatus = typeof projectStatuses.$inferSelect;
export type NewProjectStatus = typeof projectStatuses.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
