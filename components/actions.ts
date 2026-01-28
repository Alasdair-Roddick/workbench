'use server';

import { signIn, signOut, auth } from '@/auth';

export async function handleLogin() {
  await signIn('github');
}

export async function handleLogout() {
  await signOut({ redirect: false });
}

export async function getLoggedUser() {
  const session = await auth();
  return session?.user ?? null;
}
