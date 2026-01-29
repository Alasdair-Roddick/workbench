'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/app/store/store';
import { Navbar } from '@/components/navbar';
import { WelcomeScreen } from '@/components/welcome-screen';

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useUserStore((state) => state.user);

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomeScreen />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-background min-h-screen"
        >
          <Navbar />
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
