import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

// create a sample "users" table
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
});
