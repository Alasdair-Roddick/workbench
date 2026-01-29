'use client';

import { Spark } from '@/app/db/schema';
import { formatDistanceToNow } from 'date-fns';

interface SparksListProps {
  sparks: Spark[];
  onSparkClick: (spark: Spark) => void;
}

export function SparksList({ sparks, onSparkClick }: SparksListProps) {
  if (sparks.length === 0) {
    return (
      <div className="border-border bg-card/50 rounded-xl border p-6 text-center">
        <p className="text-muted-foreground">No sparks yet. Press ⌘K to capture one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sparks.map((spark) => (
        <button
          key={spark.id}
          onClick={() => onSparkClick(spark)}
          className="border-border bg-card/50 hover:bg-card w-full rounded-lg border px-4 py-3 text-left transition-colors"
        >
          <p className="text-foreground">{spark.title}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatDistanceToNow(new Date(spark.createdAt), { addSuffix: true })}
          </p>
        </button>
      ))}
    </div>
  );
}
