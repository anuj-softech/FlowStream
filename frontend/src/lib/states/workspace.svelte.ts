import { projectClient } from "$lib/transport.js";
import { auth } from "$lib/hooks/auth.svelte.js";
import type { Project, ProjectInvite, Task } from "$lib/gen/project/v1/project_pb.js";

class WorkspaceState {
  projects = $state<Project[]>([]);
  invites = $state<ProjectInvite[]>([]);
  projectDetailsMap = $state<Record<string, any>>({});
  loadingProjects = $state(false);
  loadingInvites = $state(false);
  error = $state("");

  async loadAllData() {
    this.loadingProjects = true;
    this.loadingInvites = true;
    this.error = "";
    try {
      const inviteRes = await projectClient.listInvites();
      this.invites = inviteRes.invites || [];

      const projRes = await projectClient.listProjects();
      this.projects = projRes.projects || [];

      const detailsPromises = this.projects.map(p =>
        projectClient.getProjectDetails({ projectId: p.id })
          .then(res => ({
            projectId: p.id,
            details: {
              project: res.project!,
              members: res.members || [],
              tasks: res.tasks || []
            }
          }))
          .catch(err => {
            console.error(err);
            return null;
          })
      );

      const resolved = await Promise.all(detailsPromises);
      const newMap: Record<string, any> = {};
      resolved.forEach(item => {
        if (item) {
          newMap[item.projectId] = item.details;
        }
      });
      this.projectDetailsMap = newMap;
    } catch (err: any) {
      this.error = err.message || "Failed to load data";
    } finally {
      this.loadingProjects = false;
      this.loadingInvites = false;
    }
  }

  get assignedTasks() {
    const allTasks: Task[] = [];
    const userId = auth.currentUser?.id;
    if (!userId) return allTasks;

    Object.values(this.projectDetailsMap).forEach((details: any) => {
      if (details && details.tasks) {
        details.tasks.forEach((task: Task) => {
          if (task.assignees && task.assignees.some(a => a.id === userId)) {
            allTasks.push(task);
          }
        });
      }
    });
    return allTasks;
  }
}

export const workspace = new WorkspaceState();
