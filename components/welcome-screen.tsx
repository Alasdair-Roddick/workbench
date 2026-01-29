'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { handleLogin } from './actions';

export function WelcomeScreen() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-125 w-200 rounded-full bg-violet-500/20 blur-[120px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4"
        >
          <div className="h-100 w-150 rounded-full bg-fuchsia-500/20 blur-[120px]" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8 flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-2xl shadow-violet-500/30"
        >
          <span className="text-4xl font-bold text-white">W</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="text-foreground mb-4 text-5xl font-bold tracking-tight md:text-6xl"
        >
          Welcome to{' '}
          <span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Workbench
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
          className="text-muted-foreground mb-10 max-w-md text-lg"
        >
          Sign in to get started with your projects and unlock the full experience.
        </motion.p>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
        >
          <Button
            onClick={handleLogin}
            className="group relative h-12 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-8 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </span>
          </Button>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          className="text-muted-foreground mt-8 text-sm"
        >
          Secure authentication powered by GitHub
        </motion.p>
      </div>
    </div>
  );
}
