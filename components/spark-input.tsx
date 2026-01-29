'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import { createSpark } from '@/app/api/sparks/routes';
import { useUserStore } from '@/app/store/store';

interface SparkInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSparkCreated?: () => void;
}

export function SparkInput({ open, onOpenChange, onSparkCreated }: SparkInputProps) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUserStore((state) => state.user);

  const handleSubmit = async () => {
    if (!value.trim() || !user?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createSpark(value.trim(), user.id);
      setValue('');
      onOpenChange(false);
      onSparkCreated?.();
    } catch (error) {
      console.error('Failed to create spark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="border-border bg-card p-0 sm:max-w-md">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's sparking?"
          autoFocus
          disabled={isSubmitting}
          className="text-foreground placeholder:text-muted-foreground w-full bg-transparent px-4 py-4 focus:outline-none"
        />
        <div className="border-border text-muted-foreground border-t px-4 py-2 text-xs">
          Press <kbd className="bg-muted rounded px-1.5 py-0.5">Enter</kbd> to create
        </div>
      </DialogContent>
    </Dialog>
  );
}
