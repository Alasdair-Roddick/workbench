import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { db } from '@/app/db';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      githubId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface GitHubProfile {
  id: number;
  login: string;
  email?: string;
  avatar_url?: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as unknown as GitHubProfile;

        // Upsert user in database
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.githubId, String(githubProfile.id)))
          .limit(1);

        if (existingUser.length === 0) {
          // Create new user
          await db.insert(users).values({
            githubId: String(githubProfile.id),
            username: githubProfile.login,
            email: githubProfile.email ?? null,
            avatarUrl: githubProfile.avatar_url ?? null,
            accessToken: account.access_token ?? null,
          });
        } else {
          // Update existing user
          await db
            .update(users)
            .set({
              username: githubProfile.login,
              email: githubProfile.email ?? null,
              avatarUrl: githubProfile.avatar_url ?? null,
              accessToken: account.access_token ?? null,
              updatedAt: new Date(),
            })
            .where(eq(users.githubId, String(githubProfile.id)));
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as unknown as GitHubProfile;
        // Fetch user from DB to get the UUID
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.githubId, String(githubProfile.id)))
          .limit(1);

        if (dbUser.length > 0) {
          token.userId = dbUser[0].id;
          token.githubId = dbUser[0].githubId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.githubId = token.githubId as string;
      }
      return session;
    },
  },
});
