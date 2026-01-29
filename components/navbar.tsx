'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { handleLogin } from './actions';
import { UserDropdown } from '@/components/dropdown';
import { useUserStore } from '@/app/store/store';

export function Navbar() {
  const user = useUserStore((state) => state.user);

  return (
    <nav className="border-border bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
              <span className="text-lg font-bold text-white">W</span>
            </div>
            <span className="text-foreground text-lg font-semibold transition-colors group-hover:text-violet-400">
              Workbench
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="border-border bg-muted/50 hidden items-center gap-1 rounded-full border px-2 py-1.5 md:flex">
            <Link
              href="/"
              className="text-foreground hover:bg-muted rounded-full px-4 py-1.5 text-sm font-medium transition-all"
            >
              Home
            </Link>
            <Link
              href="/projects"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full px-4 py-1.5 text-sm font-medium transition-all"
            >
              Projects
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full px-4 py-1.5 text-sm font-medium transition-all"
            >
              Docs
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium hover:bg-transparent"
                >
                  Log in
                </Button>
                <Button
                  onClick={handleLogin}
                  className="rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
