export type User = {
  id: string;
  githubId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;
