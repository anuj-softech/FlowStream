import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import { checkProjectMembership } from "./helpers.js";
import {
  GetTaskDetailsRequest,
  GetTaskDetailsResponse,
  GetTaskDetailsResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function getTaskDetails(
  req: GetTaskDetailsRequest,
  ctx: AuthenticatedContext
): Promise<GetTaskDetailsResponse> {
  const { taskId } = req;
  if (!taskId) {
    throw new ConnectError("Task ID is required", Code.InvalidArgument);
  }

  const dbTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { include: { user: true } },
      dependencies: true
    }
  });

  if (!dbTask) {
    throw new ConnectError("Task not found", Code.NotFound);
  }

  const isMember = await checkProjectMembership(dbTask.projectId, ctx.user.id);
  if (!isMember) {
    throw new ConnectError("You are not a member of this project", Code.PermissionDenied);
  }

  const mappedTask = {
    id: dbTask.id,
    projectId: dbTask.projectId,
    title: dbTask.title,
    description: dbTask.description || undefined,
    deadline: dbTask.deadline ? dbTask.deadline.toISOString() : undefined,
    status: dbTask.status,
    priority: dbTask.priority,
    parentId: dbTask.parentId || undefined,
    createdById: dbTask.createdById,
    createdAt: dbTask.createdAt.toISOString(),
    assignees: dbTask.assignees.map((a) => ({
      id: a.user.id,
      name: a.user.name,
      username: a.user.username,
      email: a.user.email,
      profilePicUrl: a.user.profilePicUrl || undefined,
      profession: a.user.profession || undefined,
      mobileNumber: a.user.mobileNumber || undefined,
      dateCreated: ""
    })),
    dependsOnTaskIds: dbTask.dependencies.map((d) => d.dependsOnTaskId)
  };

  return create(GetTaskDetailsResponseSchema, {
    task: mappedTask
  });
}
