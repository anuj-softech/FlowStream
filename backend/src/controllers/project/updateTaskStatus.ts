import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  UpdateTaskStatusRequest,
  UpdateTaskStatusResponse,
  UpdateTaskStatusResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function updateTaskStatus(
  req: UpdateTaskStatusRequest,
  ctx: AuthenticatedContext
): Promise<UpdateTaskStatusResponse> {
  const { taskId, status } = req;
  if (!taskId || !status) {
    throw new ConnectError("Task ID and status are required", Code.InvalidArgument);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignees: true
    }
  });

  if (!task) {
    throw new ConnectError("Task not found", Code.NotFound);
  }

  const isAdmin = task.project.adminId === ctx.user.id;
  const isAssignee = task.assignees.some((a) => a.userId === ctx.user.id);

  if (!isAdmin && !isAssignee) {
    throw new ConnectError("Only the project admin or assigned members can change the task status", Code.PermissionDenied);
  }

  if (status === "DONE") {
    const openSubtasks = await prisma.task.findMany({
      where: {
        parentId: taskId,
        status: { not: "DONE" }
      }
    });

    if (openSubtasks.length > 0) {
      throw new ConnectError(
        "Cannot mark task as done because it has open subtasks. Please close all subtasks first.",
        Code.FailedPrecondition
      );
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: status as any },
    include: {
      assignees: { include: { user: true } },
      dependencies: true
    }
  });

  return create(UpdateTaskStatusResponseSchema, {
    task: {
      id: updatedTask.id,
      projectId: updatedTask.projectId,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      deadline: updatedTask.deadline ? updatedTask.deadline.toISOString() : undefined,
      status: updatedTask.status,
      priority: updatedTask.priority,
      parentId: updatedTask.parentId || undefined,
      createdById: updatedTask.createdById,
      createdAt: updatedTask.createdAt.toISOString(),
      assignees: updatedTask.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        username: a.user.username,
        email: a.user.email,
        profilePicUrl: a.user.profilePicUrl || undefined,
        profession: a.user.profession || undefined,
        mobileNumber: a.user.mobileNumber || undefined,
        dateCreated: ""
      })),
      dependsOnTaskIds: updatedTask.dependencies.map((d) => d.dependsOnTaskId)
    },
    message: "Status updated successfully"
  });
}
