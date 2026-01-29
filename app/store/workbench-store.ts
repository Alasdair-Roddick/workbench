import { create } from 'zustand';
import { Spark, Idea } from '@/app/db/schema';

interface WorkbenchStore {
  // Sparks
  sparks: Spark[];
  setSparks: (sparks: Spark[]) => void;
  addSpark: (spark: Spark) => void;
  removeSpark: (sparkId: string) => void;

  // Ideas
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
  removeIdea: (ideaId: string) => void;
}

export const useWorkbenchStore = create<WorkbenchStore>((set) => ({
  // Sparks
  sparks: [],
  setSparks: (sparks) => set({ sparks }),
  addSpark: (spark) => set((state) => ({ sparks: [spark, ...state.sparks] })),
  removeSpark: (sparkId) =>
    set((state) => ({
      sparks: state.sparks.filter((s) => s.id !== sparkId),
    })),

  // Ideas
  ideas: [],
  setIdeas: (ideas) => set({ ideas }),
  addIdea: (idea) => set((state) => ({ ideas: [idea, ...state.ideas] })),
  updateIdea: (ideaId, updates) =>
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === ideaId ? { ...i, ...updates } : i)),
    })),
  removeIdea: (ideaId) =>
    set((state) => ({
      ideas: state.ideas.filter((i) => i.id !== ideaId),
    })),
}));
