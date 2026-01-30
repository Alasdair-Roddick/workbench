import { create } from 'zustand';
import { Project } from '@/app/db/schema';

interface ProjectStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  removeProject: (projectId: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)),
    })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    })),
}));
