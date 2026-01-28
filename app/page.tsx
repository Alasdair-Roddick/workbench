'use client';

import { useUserStore } from '@/app/store/store';

export default function Home() {
  const user = useUserStore((state) => state.user);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-2 text-neutral-400">
          Here&apos;s what&apos;s happening with your projects.
        </p>
      </div>

      {/* Dashboard content placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-2 text-sm font-medium text-neutral-400">Projects</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-2 text-sm font-medium text-neutral-400">Tasks</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-2 text-sm font-medium text-neutral-400">Completed</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
      </div>
    </main>
  );
}
