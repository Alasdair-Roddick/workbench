'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Idea } from '@/app/db/schema';
import { useState, useEffect } from 'react';
import { updateIdea as updateIdeaApi, archiveIdea, deleteIdeaById } from '@/app/api/ideas/routes';
import { createProject } from '@/app/api/projects/routes';
import { useUserStore } from '@/app/store/store';
import { useWorkbenchStore } from '@/app/store/workbench-store';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Archive,
  Rocket,
  Trash2,
  Sparkles,
  FileText,
  Lightbulb,
  Code,
} from 'lucide-react';

interface IdeaDetailModalProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdeaDetailModal({ idea, open, onOpenChange }: IdeaDetailModalProps) {
  const user = useUserStore((state) => state.user);
  const { updateIdea: updateIdeaInStore, removeIdea } = useWorkbenchStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [userStory, setUserStory] = useState('');
  const [techStack, setTechStack] = useState('');

  // Reset form when idea changes
  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description || '');
      setNotes(idea.notes || '');
      setUserStory(idea.userStory || '');
      setTechStack(idea.techStack || '');
      setHasChanges(false);
    }
  }, [idea]);

  // Track changes
  useEffect(() => {
    if (!idea) return;
    const changed =
      title !== idea.title ||
      description !== (idea.description || '') ||
      notes !== (idea.notes || '') ||
      userStory !== (idea.userStory || '') ||
      techStack !== (idea.techStack || '');
    setHasChanges(changed);
  }, [idea, title, description, notes, userStory, techStack]);

  if (!idea) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateIdeaApi(idea.id, {
        title,
        description: description || undefined,
        notes: notes || undefined,
        userStory: userStory || undefined,
        techStack: techStack || undefined,
      });
      updateIdeaInStore(idea.id, updated);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update idea:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveIdea(idea.id);
      removeIdea(idea.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to archive idea:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIdeaById(idea.id);
      removeIdea(idea.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  const handlePromoteToProject = async () => {
    if (!user?.id) return;

    setIsPromoting(true);
    try {
      // Save any pending changes first
      if (hasChanges) {
        await updateIdeaApi(idea.id, {
          title,
          description: description || undefined,
          notes: notes || undefined,
          userStory: userStory || undefined,
          techStack: techStack || undefined,
        });
      }

      // Create the project
      await createProject({
        title,
        userId: user.id,
        ideaOriginId: idea.id,
        description: description || undefined,
        userStory: userStory || undefined,
        techStack: techStack || undefined,
      });

      // Archive the idea (soft delete - preserve lineage)
      await archiveIdea(idea.id);
      removeIdea(idea.id);

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to promote to project:', error);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }
    onOpenChange(false);
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0, 0, 0.2, 1] as const,
      },
    }),
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="border-border bg-card flex h-[90vh] max-h-[900px] flex-col overflow-hidden p-0 sm:max-w-4xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idea.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="border-border flex items-center justify-between border-b px-6 py-4"
            >
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </button>
              <div className="flex items-center gap-1">
                <Button
                  onClick={handleArchive}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* Title */}
              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Idea title"
                  className="text-foreground placeholder:text-muted-foreground mb-2 w-full bg-transparent text-3xl font-bold focus:outline-none"
                />
                <p className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
                  <span>
                    Created {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                  </span>
                  {idea.sparkOriginId && (
                    <>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Promoted from spark
                      </span>
                    </>
                  )}
                </p>
              </motion.div>

              {/* Fields Grid */}
              <div className="space-y-6">
                {/* Description */}
                <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this idea about? What problem does it solve?"
                    className="border-border bg-muted/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-muted/30 h-32 w-full resize-none rounded-xl border px-4 py-3 transition-colors focus:outline-none"
                  />
                </motion.div>

                {/* Notes */}
                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Early thinking, research, rough ideas, links..."
                    className="border-border bg-muted/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-muted/30 h-32 w-full resize-none rounded-xl border px-4 py-3 transition-colors focus:outline-none"
                  />
                </motion.div>

                {/* Two-column grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* User Story */}
                  <motion.div
                    custom={3}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <label className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                      <Lightbulb className="h-4 w-4" />
                      User Story
                    </label>
                    <textarea
                      value={userStory}
                      onChange={(e) => setUserStory(e.target.value)}
                      placeholder="As a [user], I want [goal] so that [benefit]..."
                      className="border-border bg-muted/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-muted/30 h-32 w-full resize-none rounded-xl border px-4 py-3 transition-colors focus:outline-none"
                    />
                  </motion.div>

                  {/* Tech Stack */}
                  <motion.div
                    custom={4}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <label className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                      <Code className="h-4 w-4" />
                      Tech Stack
                    </label>
                    <textarea
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      placeholder="React, Node.js, PostgreSQL..."
                      className="border-border bg-muted/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-muted/30 h-32 w-full resize-none rounded-xl border px-4 py-3 transition-colors focus:outline-none"
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="border-border flex items-center justify-between border-t px-6 py-4"
            >
              <Button
                onClick={handlePromoteToProject}
                disabled={isPromoting || !title.trim()}
                className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {isPromoting ? 'Promoting...' : 'Promote to Project'}
              </Button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={hasChanges ? 'unsaved' : 'saved'}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges || !title.trim()}
                    variant={hasChanges ? 'default' : 'outline'}
                  >
                    {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
