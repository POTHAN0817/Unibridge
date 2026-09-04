import { mockProjects } from "../data/mock/projects";
import { Project } from "../types";

let projectsState: Project[] = [...mockProjects];

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...projectsState];
  },

  async getProjectById(id: string): Promise<Project | null> {
    await new Promise((r) => setTimeout(r, 150));
    return projectsState.find((p) => p.id === id) || null;
  },

  async getProjectsByUniversity(universityName: string): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 200));
    return projectsState.filter((p) =>
      p.university.toLowerCase().includes(universityName.toLowerCase())
    );
  },

  async updateMilestone(projectId: string, milestoneIndex: number, done: boolean): Promise<Project | null> {
    await new Promise((r) => setTimeout(r, 200));
    const project = projectsState.find((p) => p.id === projectId);
    if (!project || !project.milestones[milestoneIndex]) return null;

    project.milestones[milestoneIndex].done = done;
    return { ...project };
  },
};
