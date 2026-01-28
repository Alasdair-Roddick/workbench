import { config } from 'dotenv';
import { describe, it, expect } from 'vitest';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { db } from '@/app/db';
import { users } from '@/app/db/schema';

config({ path: '.env.local' });

describe('database connection test', () => {
  it('should connect to the database and run a simple query', async () => {
    const sql = neon(process.env.DATABASE_URL!);
    const res = await sql`SELECT 1 + 1 AS result`;
    expect(res[0].result).toBe(2);
  });
});

describe('user operations', () => {
  const testEmail = `test-${Date.now()}@example.com`;

  it('should create and delete a user', async () => {
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: 'Test User',
        email: testEmail,
      })
      .returning();

    expect(newUser).toBeDefined();
    expect(newUser.name).toBe('Test User');
    expect(newUser.email).toBe(testEmail);

    // Delete user
    const [deletedUser] = await db.delete(users).where(eq(users.id, newUser.id)).returning();

    expect(deletedUser.id).toBe(newUser.id);

    // Verify user is deleted
    const [foundUser] = await db.select().from(users).where(eq(users.id, newUser.id));

    expect(foundUser).toBeUndefined();
  });
});
