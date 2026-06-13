import { prisma } from "../../prisma.js";

// Helper: check if a user is a member of the project
export async function checkProjectMembership(projectId: string, userId: string): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });
  return !!member;
}

export async function checkTaskAssigneeOrAdmin(projectId: string, taskId: string, userId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      project: { select: { adminId: true } },
      assignees: { select: { userId: true } }
    }
  });

  if (!task) return false;

  const isAdmin = task.project.adminId === userId;
  const isAssignee = task.assignees.some((a) => a.userId === userId);

  return isAdmin || isAssignee;
}

// Helper: DFS cycle detection for task dependencies
export async function hasDependencyCycle(
  taskId: string,
  potentialDependencyId: string
): Promise<boolean> {
  if (taskId === potentialDependencyId) return true;

  const dependencies = await prisma.taskDependency.findMany({
    where: { taskId: potentialDependencyId }
  });

  for (const dep of dependencies) {
    if (dep.dependsOnTaskId === taskId) return true;
    const hasCycle = await hasDependencyCycle(taskId, dep.dependsOnTaskId);
    if (hasCycle) return true;
  }

  return false;
}
