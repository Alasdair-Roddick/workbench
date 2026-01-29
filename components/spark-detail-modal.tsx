'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spark } from '@/app/db/schema';
import { useState } from 'react';
import { createIdea } from '@/app/api/ideas/routes';
import { deleteSparkById } from '@/app/api/sparks/routes';
import { useUserStore } from '@/app/store/store';
import { formatDistanceToNow } from 'date-fns';

interface SparkDetailModalProps {
  spark: Spark | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSparkDeleted: () => void;
  onPromoted: () => void;
}

export function SparkDetailModal({
  spark,
  open,
  onOpenChange,
  onSparkDeleted,
  onPromoted,
}: SparkDetailModalProps) {
  const [isPromoting, setIsPromoting] = useState(false);
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const user = useUserStore((state) => state.user);

  if (!spark) return null;

  const handlePromote = async () => {
    if (!user?.id) return;

    setIsPromoting(true);
    try {
      await createIdea({
        title: spark.title,
        userId: user.id,
        sparkOriginId: spark.id,
        description: description || undefined,
        notes: notes || undefined,
      });
      await deleteSparkById(spark.id);
      setShowPromoteForm(false);
      setDescription('');
      setNotes('');
      onOpenChange(false);
      onPromoted();
    } catch (error) {
      console.error('Failed to promote spark:', error);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSparkById(spark.id);
      onOpenChange(false);
      onSparkDeleted();
    } catch (error) {
      console.error('Failed to delete spark:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{spark.title}</DialogTitle>
          <p className="text-muted-foreground text-xs">
            Created {formatDistanceToNow(new Date(spark.createdAt), { addSuffix: true })}
          </p>
        </DialogHeader>

        {!showPromoteForm ? (
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setShowPromoteForm(true)} className="flex-1">
              Promote to Idea
            </Button>
            <Button onClick={handleDelete} variant="outline">
              Delete
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this idea about?"
                className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:border-ring h-24 w-full resize-none rounded-lg border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any early thinking or notes..."
                className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:border-ring h-24 w-full resize-none rounded-lg border px-3 py-2 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePromote} disabled={isPromoting} className="flex-1">
                {isPromoting ? 'Promoting...' : 'Create Idea'}
              </Button>
              <Button onClick={() => setShowPromoteForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
