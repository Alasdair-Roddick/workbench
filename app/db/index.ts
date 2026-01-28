import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';

let _db: NeonHttpDatabase | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle({ client: sql });
  }
  return _db;
}

// For backward compatibility
export const db = new Proxy({} as NeonHttpDatabase, {
  get(_, prop) {
    return getDb()[prop as keyof NeonHttpDatabase];
  },
});
