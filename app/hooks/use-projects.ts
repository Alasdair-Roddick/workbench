import { useProjectStore } from '@/app/store/project-store';
import {
  createProject,
  getActiveProjectsByUserId,
  updateProject as updateProjectApi,
  deleteProjectById,
  archiveProject as archiveProjectApi,
} from '@/app/api/projects/routes';

export function useProjects() {
  const store = useProjectStore();

  const fetchProjects = async (userId: string) => {
    const projects = await getActiveProjectsByUserId(userId);
    store.setProjects(projects);
    return projects;
  };

  const create = async (data: {
    title: string;
    userId: string;
    ideaOriginId?: string;
    description?: string;
    userStory?: string;
    techStack?: string;
  }) => {
    const project = await createProject(data);
    store.addProject(project);
    return project;
  };

  const update = async (
    projectId: string,
    data: {
      title?: string;
      description?: string;
      userStory?: string;
      techStack?: string;
      githubRepoUrl?: string;
      githubRepoName?: string;
      githubRepoOwner?: string;
    },
  ) => {
    const updated = await updateProjectApi(projectId, data);
    store.updateProject(projectId, updated);
    return updated;
  };

  const remove = async (projectId: string) => {
    await deleteProjectById(projectId);
    store.removeProject(projectId);
    if (store.activeProjectId === projectId) {
      store.setActiveProjectId(null);
    }
  };

  const archive = async (projectId: string) => {
    await archiveProjectApi(projectId);
    store.removeProject(projectId);
    if (store.activeProjectId === projectId) {
      store.setActiveProjectId(null);
    }
  };

  const setActive = (projectId: string | null) => {
    store.setActiveProjectId(projectId);
  };

  return {
    projects: store.projects,
    activeProjectId: store.activeProjectId,
    activeProject: store.getActiveProject(),
    getProjectById: store.getProjectById,
    fetchProjects,
    create,
    update,
    remove,
    archive,
    setActive,
  };
}
