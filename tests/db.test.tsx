import { config } from 'dotenv';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { db } from '@/app/db';
import { users, sparks, ideas, projects, projectStatuses, tasks } from '@/app/db/schema';

config({ path: '.env.local' });

describe('database connection test', () => {
  it('should connect to the database and run a simple query', async () => {
    const sql = neon(process.env.DATABASE_URL!);
    const res = await sql`SELECT 1 + 1 AS result`;
    expect(res[0].result).toBe(2);
  });
});

describe('users table', () => {
  let testUserId: string;

  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should create a new user', async () => {
    const [newUser] = await db
      .insert(users)
      .values({
        githubId: 'test-github-123',
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.png',
      })
      .returning();

    testUserId = newUser.id;

    expect(newUser).toBeDefined();
    expect(newUser.githubId).toBe('test-github-123');
    expect(newUser.username).toBe('testuser');
    expect(newUser.email).toBe('test@example.com');
    expect(newUser.createdAt).toBeInstanceOf(Date);
  });

  it('should read a user by id', async () => {
    const [user] = await db.select().from(users).where(eq(users.id, testUserId));

    expect(user).toBeDefined();
    expect(user.id).toBe(testUserId);
  });

  it('should update a user', async () => {
    const [updatedUser] = await db
      .update(users)
      .set({ username: 'updateduser' })
      .where(eq(users.id, testUserId))
      .returning();

    expect(updatedUser.username).toBe('updateduser');
  });

  it('should enforce unique githubId constraint', async () => {
    await expect(
      db.insert(users).values({
        githubId: 'test-github-123',
        username: 'anotheruser',
      }),
    ).rejects.toThrow();
  });
});

describe('sparks table', () => {
  let testUserId: string;
  let testSparkId: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({
        githubId: 'spark-test-user',
        username: 'sparkuser',
      })
      .returning();
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should create a new spark', async () => {
    const [newSpark] = await db
      .insert(sparks)
      .values({
        userId: testUserId,
        title: 'My first spark idea',
      })
      .returning();

    testSparkId = newSpark.id;

    expect(newSpark).toBeDefined();
    expect(newSpark.title).toBe('My first spark idea');
    expect(newSpark.userId).toBe(testUserId);
    expect(newSpark.archivedAt).toBeNull();
  });

  it('should read a spark by id', async () => {
    const [spark] = await db.select().from(sparks).where(eq(sparks.id, testSparkId));

    expect(spark).toBeDefined();
    expect(spark.title).toBe('My first spark idea');
  });

  it('should update a spark', async () => {
    const [updatedSpark] = await db
      .update(sparks)
      .set({ title: 'Updated spark title' })
      .where(eq(sparks.id, testSparkId))
      .returning();

    expect(updatedSpark.title).toBe('Updated spark title');
  });

  it('should archive a spark', async () => {
    const [archivedSpark] = await db
      .update(sparks)
      .set({ archivedAt: new Date() })
      .where(eq(sparks.id, testSparkId))
      .returning();

    expect(archivedSpark.archivedAt).toBeInstanceOf(Date);
  });

  it('should cascade delete sparks when user is deleted', async () => {
    const [tempUser] = await db
      .insert(users)
      .values({
        githubId: 'temp-cascade-user',
        username: 'tempuser',
      })
      .returning();

    await db.insert(sparks).values({
      userId: tempUser.id,
      title: 'Temp spark',
    });

    await db.delete(users).where(eq(users.id, tempUser.id));

    const remainingSparks = await db.select().from(sparks).where(eq(sparks.userId, tempUser.id));

    expect(remainingSparks).toHaveLength(0);
  });
});

describe('ideas table', () => {
  let testUserId: string;
  let testSparkId: string;
  let testIdeaId: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({
        githubId: 'idea-test-user',
        username: 'ideauser',
      })
      .returning();
    testUserId = user.id;

    const [spark] = await db
      .insert(sparks)
      .values({
        userId: testUserId,
        title: 'Origin spark',
      })
      .returning();
    testSparkId = spark.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should create an idea from a spark', async () => {
    const [newIdea] = await db
      .insert(ideas)
      .values({
        userId: testUserId,
        sparkOriginId: testSparkId,
        title: 'Expanded idea',
        description: 'This is a detailed description',
        notes: 'Some notes here',
        userStory: 'As a user, I want...',
        techStack: 'Next.js, TypeScript',
      })
      .returning();

    testIdeaId = newIdea.id;

    expect(newIdea).toBeDefined();
    expect(newIdea.title).toBe('Expanded idea');
    expect(newIdea.sparkOriginId).toBe(testSparkId);
    expect(newIdea.description).toBe('This is a detailed description');
  });

  it('should create an idea without a spark origin', async () => {
    const [newIdea] = await db
      .insert(ideas)
      .values({
        userId: testUserId,
        title: 'Standalone idea',
      })
      .returning();

    expect(newIdea).toBeDefined();
    expect(newIdea.sparkOriginId).toBeNull();

    await db.delete(ideas).where(eq(ideas.id, newIdea.id));
  });

  it('should set sparkOriginId to null when origin spark is deleted', async () => {
    const [tempSpark] = await db
      .insert(sparks)
      .values({
        userId: testUserId,
        title: 'Temp spark for deletion',
      })
      .returning();

    const [ideaWithSpark] = await db
      .insert(ideas)
      .values({
        userId: testUserId,
        sparkOriginId: tempSpark.id,
        title: 'Idea linked to temp spark',
      })
      .returning();

    await db.delete(sparks).where(eq(sparks.id, tempSpark.id));

    const [updatedIdea] = await db.select().from(ideas).where(eq(ideas.id, ideaWithSpark.id));

    expect(updatedIdea.sparkOriginId).toBeNull();

    await db.delete(ideas).where(eq(ideas.id, ideaWithSpark.id));
  });
});

describe('projects table', () => {
  let testUserId: string;
  let testIdeaId: string;
  let testProjectId: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({
        githubId: 'project-test-user',
        username: 'projectuser',
      })
      .returning();
    testUserId = user.id;

    const [idea] = await db
      .insert(ideas)
      .values({
        userId: testUserId,
        title: 'Origin idea',
      })
      .returning();
    testIdeaId = idea.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should create a project from an idea', async () => {
    const [newProject] = await db
      .insert(projects)
      .values({
        userId: testUserId,
        ideaOriginId: testIdeaId,
        title: 'My Project',
        description: 'Project description',
        githubRepoUrl: 'https://github.com/user/repo',
        githubRepoName: 'repo',
        githubRepoOwner: 'user',
      })
      .returning();

    testProjectId = newProject.id;

    expect(newProject).toBeDefined();
    expect(newProject.title).toBe('My Project');
    expect(newProject.ideaOriginId).toBe(testIdeaId);
    expect(newProject.githubRepoUrl).toBe('https://github.com/user/repo');
  });

  it('should create a project without an idea origin', async () => {
    const [newProject] = await db
      .insert(projects)
      .values({
        userId: testUserId,
        title: 'Standalone project',
      })
      .returning();

    expect(newProject).toBeDefined();
    expect(newProject.ideaOriginId).toBeNull();

    await db.delete(projects).where(eq(projects.id, newProject.id));
  });

  it('should update project GitHub info', async () => {
    const [updatedProject] = await db
      .update(projects)
      .set({
        githubRepoUrl: 'https://github.com/user/new-repo',
        githubRepoName: 'new-repo',
      })
      .where(eq(projects.id, testProjectId))
      .returning();

    expect(updatedProject.githubRepoUrl).toBe('https://github.com/user/new-repo');
    expect(updatedProject.githubRepoName).toBe('new-repo');
  });
});

describe('projectStatuses table', () => {
  let testUserId: string;
  let testProjectId: string;
  let testStatusId: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({
        githubId: 'status-test-user',
        username: 'statususer',
      })
      .returning();
    testUserId = user.id;

    const [project] = await db
      .insert(projects)
      .values({
        userId: testUserId,
        title: 'Status test project',
      })
      .returning();
    testProjectId = project.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should create project statuses with order', async () => {
    const [todoStatus] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'To Do',
        color: '#ef4444',
        order: 0,
      })
      .returning();

    testStatusId = todoStatus.id;

    const [inProgressStatus] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'In Progress',
        color: '#f59e0b',
        order: 1,
      })
      .returning();

    const [doneStatus] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'Done',
        color: '#22c55e',
        order: 2,
      })
      .returning();

    expect(todoStatus.order).toBe(0);
    expect(inProgressStatus.order).toBe(1);
    expect(doneStatus.order).toBe(2);
  });

  it('should use default color when not specified', async () => {
    const [status] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'Backlog',
        order: 3,
      })
      .returning();

    expect(status.color).toBe('#6b7280');

    await db.delete(projectStatuses).where(eq(projectStatuses.id, status.id));
  });

  it('should cascade delete statuses when project is deleted', async () => {
    const [tempProject] = await db
      .insert(projects)
      .values({
        userId: testUserId,
        title: 'Temp project',
      })
      .returning();

    await db.insert(projectStatuses).values({
      projectId: tempProject.id,
      name: 'Temp Status',
      order: 0,
    });

    await db.delete(projects).where(eq(projects.id, tempProject.id));

    const remainingStatuses = await db
      .select()
      .from(projectStatuses)
      .where(eq(projectStatuses.projectId, tempProject.id));

    expect(remainingStatuses).toHaveLength(0);
  });
});

describe('tasks table', () => {
  let testUserId: string;
  let testProjectId: string;
  let testStatusId: string;
  let testTaskId: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({
        githubId: 'task-test-user',
        username: 'taskuser',
      })
      .returning();
    testUserId = user.id;

    const [project] = await db
      .insert(projects)
      .values({
        userId: testUserId,
        title: 'Task test project',
      })
      .returning();
    testProjectId = project.id;

    const [status] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'To Do',
        order: 0,
      })
      .returning();
    testStatusId = status.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should create a task with status', async () => {
    const [newTask] = await db
      .insert(tasks)
      .values({
        projectId: testProjectId,
        statusId: testStatusId,
        title: 'Implement feature X',
        description: 'Detailed task description',
        branchName: 'feature/x',
        order: 0,
      })
      .returning();

    testTaskId = newTask.id;

    expect(newTask).toBeDefined();
    expect(newTask.title).toBe('Implement feature X');
    expect(newTask.statusId).toBe(testStatusId);
    expect(newTask.branchName).toBe('feature/x');
  });

  it('should create a task without status', async () => {
    const [newTask] = await db
      .insert(tasks)
      .values({
        projectId: testProjectId,
        title: 'Unassigned task',
        order: 1,
      })
      .returning();

    expect(newTask).toBeDefined();
    expect(newTask.statusId).toBeNull();

    await db.delete(tasks).where(eq(tasks.id, newTask.id));
  });

  it('should update task status', async () => {
    const [inProgressStatus] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'In Progress',
        order: 1,
      })
      .returning();

    const [updatedTask] = await db
      .update(tasks)
      .set({ statusId: inProgressStatus.id })
      .where(eq(tasks.id, testTaskId))
      .returning();

    expect(updatedTask.statusId).toBe(inProgressStatus.id);
  });

  it('should set statusId to null when status is deleted', async () => {
    const [tempStatus] = await db
      .insert(projectStatuses)
      .values({
        projectId: testProjectId,
        name: 'Temp Status',
        order: 99,
      })
      .returning();

    const [taskWithStatus] = await db
      .insert(tasks)
      .values({
        projectId: testProjectId,
        statusId: tempStatus.id,
        title: 'Task with temp status',
        order: 99,
      })
      .returning();

    await db.delete(projectStatuses).where(eq(projectStatuses.id, tempStatus.id));

    const [updatedTask] = await db.select().from(tasks).where(eq(tasks.id, taskWithStatus.id));

    expect(updatedTask.statusId).toBeNull();

    await db.delete(tasks).where(eq(tasks.id, taskWithStatus.id));
  });

  it('should cascade delete tasks when project is deleted', async () => {
    const [tempProject] = await db
      .insert(projects)
      .values({
        userId: testUserId,
        title: 'Temp project for tasks',
      })
      .returning();

    await db.insert(tasks).values({
      projectId: tempProject.id,
      title: 'Task to be deleted',
      order: 0,
    });

    await db.delete(projects).where(eq(projects.id, tempProject.id));

    const remainingTasks = await db.select().from(tasks).where(eq(tasks.projectId, tempProject.id));

    expect(remainingTasks).toHaveLength(0);
  });
});
