'use server';

/**
 * @file app/api/sparks/routes.ts
 * @brief This is the module for creating api routes related to sparks.
 *
 * @description A spark is defined as a small idea or thought that can lead to a larger project. the goal is to keep the spart input as small as possible. just an input field and a submit button. (this will come with the component)
 * @module sparks/routes
 */

import { sparks } from '@/app/db/schema';
import { db } from '@/app/db/index';
import { eq, desc } from 'drizzle-orm';

/**
 * @brief Create a new spark for a user.
 * @param title
 * @param userId
 * @returns The newly created spark object
 */
export async function createSpark(title: string, userId: string) {
  const newSpark = await db
    .insert(sparks)
    .values({
      title,
      userId,
    })
    .returning();
  return newSpark[0];
}

/**
 * @brief Get all sparks for a user by their user ID.
 * @param userId
 * @returns
 */
export async function getSparksByUserId(userId: string) {
  const userSparks = await db
    .select()
    .from(sparks)
    .where(eq(sparks.userId, userId))
    .orderBy(desc(sparks.createdAt));
  return userSparks;
}

/**
 * @brief Delete a spark by its ID.
 * @param sparkId
 */

export async function deleteSparkById(sparkId: string) {
  await db.delete(sparks).where(eq(sparks.id, sparkId));
}
