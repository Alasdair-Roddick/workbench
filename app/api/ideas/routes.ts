'use server';

import { ideas } from '@/app/db/schema';
import { db } from '@/app/db/index';
import { eq, desc } from 'drizzle-orm';

export async function createIdea(data: {
  title: string;
  userId: string;
  sparkOriginId?: string;
  description?: string;
  notes?: string;
  userStory?: string;
  techStack?: string;
}) {
  const newIdea = await db
    .insert(ideas)
    .values({
      title: data.title,
      userId: data.userId,
      sparkOriginId: data.sparkOriginId,
      description: data.description,
      notes: data.notes,
      userStory: data.userStory,
      techStack: data.techStack,
    })
    .returning();
  return newIdea[0];
}

export async function getIdeasByUserId(userId: string) {
  const userIdeas = await db
    .select()
    .from(ideas)
    .where(eq(ideas.userId, userId))
    .orderBy(desc(ideas.createdAt));
  return userIdeas;
}

export async function getActiveIdeasByUserId(userId: string) {
  const userIdeas = await db
    .select()
    .from(ideas)
    .where(eq(ideas.userId, userId))
    .orderBy(desc(ideas.createdAt));
  return userIdeas.filter((idea) => idea.archivedAt === null);
}

export async function getIdeaById(ideaId: string) {
  const idea = await db.select().from(ideas).where(eq(ideas.id, ideaId));
  return idea[0];
}

export async function updateIdea(
  ideaId: string,
  data: {
    title?: string;
    description?: string;
    notes?: string;
    userStory?: string;
    techStack?: string;
  },
) {
  const updated = await db
    .update(ideas)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ideas.id, ideaId))
    .returning();
  return updated[0];
}

export async function archiveIdea(ideaId: string) {
  await db.update(ideas).set({ archivedAt: new Date() }).where(eq(ideas.id, ideaId));
}

export async function deleteIdeaById(ideaId: string) {
  await db.delete(ideas).where(eq(ideas.id, ideaId));
}
