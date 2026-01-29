'use server';

import { projects } from '@/app/db/schema';
import { db } from '@/app/db/index';
import { eq, desc } from 'drizzle-orm';

export async function createProject(data: {
  title: string;
  userId: string;
  ideaOriginId?: string;
  description?: string;
  userStory?: string;
  techStack?: string;
}) {
  const newProject = await db
    .insert(projects)
    .values({
      title: data.title,
      userId: data.userId,
      ideaOriginId: data.ideaOriginId,
      description: data.description,
      userStory: data.userStory,
      techStack: data.techStack,
    })
    .returning();
  return newProject[0];
}

export async function getProjectsByUserId(userId: string) {
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
  return userProjects;
}

export async function getActiveProjectsByUserId(userId: string) {
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
  return userProjects.filter((project) => project.archivedAt === null);
}

export async function getProjectById(projectId: string) {
  const project = await db.select().from(projects).where(eq(projects.id, projectId));
  return project[0];
}

export async function updateProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
    userStory?: string;
    techStack?: string;
    githubRepoUrl?: string;
    githubRepoName?: string;
    githubRepoOwner?: string;
  },
) {
  const updated = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();
  return updated[0];
}

export async function archiveProject(projectId: string) {
  await db.update(projects).set({ archivedAt: new Date() }).where(eq(projects.id, projectId));
}

export async function deleteProjectById(projectId: string) {
  await db.delete(projects).where(eq(projects.id, projectId));
}
