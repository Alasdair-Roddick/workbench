import { signIn } from '@/auth';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <form
        action={async () => {
          'use server';
          await signIn('github');
        }}
      >
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Sign in with GitHub
        </button>
      </form>
    </main>
  );
}
