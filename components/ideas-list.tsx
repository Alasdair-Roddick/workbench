'use client';

import { Idea } from '@/app/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { Lightbulb } from 'lucide-react';

interface IdeasListProps {
  ideas: Idea[];
  onIdeaClick: (idea: Idea) => void;
}

export function IdeasList({ ideas, onIdeaClick }: IdeasListProps) {
  if (ideas.length === 0) {
    return (
      <div className="border-border bg-card/50 rounded-xl border p-6 text-center">
        <Lightbulb className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-50" />
        <p className="text-muted-foreground">No ideas yet. Promote a spark to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ideas.map((idea) => (
        <button
          key={idea.id}
          onClick={() => onIdeaClick(idea)}
          className="border-border bg-card/50 hover:bg-card w-full rounded-lg border px-4 py-3 text-left transition-colors"
        >
          <p className="text-foreground font-medium">{idea.title}</p>
          {idea.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{idea.description}</p>
          )}
          <p className="text-muted-foreground mt-2 text-xs">
            {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </p>
        </button>
      ))}
    </div>
  );
}
