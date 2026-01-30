import { create } from 'zustand';
import { Project } from '@/app/db/schema';

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  setActiveProjectId: (projectId: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProjectId: null,
  setProjects: (projects) => set({ projects }),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)),
    })),
}));
