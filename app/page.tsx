'use client';

import { useUserStore } from '@/app/store/store';
import { useWorkbenchStore } from '@/app/store/workbench-store';
import { SparkInput } from '@/components/spark-input';
import { SparksList } from '@/components/sparks-list';
import { SparkDetailModal } from '@/components/spark-detail-modal';
import { IdeasList } from '@/components/ideas-list';
import { IdeaDetailModal } from '@/components/idea-detail-modal';
import { useState, useEffect } from 'react';
import { getSparksByUserId } from '@/app/api/sparks/routes';
import { getActiveIdeasByUserId } from '@/app/api/ideas/routes';
import { Spark, Idea } from '@/app/db/schema';
import { Kbd } from '@/components/ui/kbd';

export default function Home() {
  const user = useUserStore((state) => state.user);
  const { sparks, setSparks, ideas, setIdeas } = useWorkbenchStore();
  const [sparkInputOpen, setSparkInputOpen] = useState(false);
  const [selectedSpark, setSelectedSpark] = useState<Spark | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [sparkDetailOpen, setSparkDetailOpen] = useState(false);
  const [ideaDetailOpen, setIdeaDetailOpen] = useState(false);

  // Fetch sparks on mount
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getSparksByUserId(user.id).then((userSparks) => {
      if (!cancelled) setSparks(userSparks);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, setSparks]);

  // Fetch ideas on mount
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getActiveIdeasByUserId(user.id).then((userIdeas) => {
      if (!cancelled) setIdeas(userIdeas);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, setIdeas]);

  // Keyboard shortcut for quick capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSparkInputOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSparkClick = (spark: Spark) => {
    setSelectedSpark(spark);
    setSparkDetailOpen(true);
  };

  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdea(idea);
    setIdeaDetailOpen(true);
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-foreground text-4xl font-bold">
          {user?.name ? `Hey, ${user.name.split(' ')[0]}` : 'Workbench'}
        </h1>
        <p className="text-muted-foreground mt-3">Capture sparks. Nurture ideas. Build projects.</p>
      </div>

      {/* Quick capture prompt */}
      <button
        onClick={() => setSparkInputOpen(true)}
        className="border-border bg-card/50 text-muted-foreground hover:border-primary/30 hover:bg-card mb-12 w-full rounded-xl border border-dashed px-6 py-4 text-left transition-colors"
      >
        <span>What&apos;s on your mind?</span>
        <Kbd className="ml-2 text-xs">⌘K</Kbd>
      </button>

      {/* Two-column grid: Sparks and Ideas */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Sparks section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-medium">Sparks</h2>
            {sparks.length > 0 && (
              <span className="text-muted-foreground text-sm">{sparks.length}</span>
            )}
          </div>
          <SparksList sparks={sparks} onSparkClick={handleSparkClick} />
        </div>

        {/* Ideas section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-medium">Ideas</h2>
            {ideas.length > 0 && (
              <span className="text-muted-foreground text-sm">{ideas.length}</span>
            )}
          </div>
          <IdeasList ideas={ideas} onIdeaClick={handleIdeaClick} />
        </div>
      </div>

      <SparkInput open={sparkInputOpen} onOpenChange={setSparkInputOpen} />

      <SparkDetailModal
        spark={selectedSpark}
        open={sparkDetailOpen}
        onOpenChange={setSparkDetailOpen}
      />

      <IdeaDetailModal idea={selectedIdea} open={ideaDetailOpen} onOpenChange={setIdeaDetailOpen} />
    </main>
  );
}
