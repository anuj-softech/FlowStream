import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import { generateUuidV7 } from "../../utils/uuid.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import { checkProjectMembership, hasDependencyCycle } from "./helpers.js";
import {
  AddTaskDependencyRequest,
  AddTaskDependencyResponse,
  AddTaskDependencyResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function addTaskDependency(
  req: AddTaskDependencyRequest,
  ctx: AuthenticatedContext
): Promise<AddTaskDependencyResponse> {
  const { taskId, dependsOnTaskId } = req;
  if (!taskId || !dependsOnTaskId) {
    throw new ConnectError("Task ID and depends-on Task ID are required", Code.InvalidArgument);
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  const depTask = await prisma.task.findUnique({ where: { id: dependsOnTaskId } });

  if (!task || !depTask) {
    throw new ConnectError("One or both tasks were not found", Code.NotFound);
  }

  if (task.projectId !== depTask.projectId) {
    throw new ConnectError("Tasks must belong to the same project", Code.InvalidArgument);
  }

  if(task.deadline && depTask.deadline){
    if (task.deadline.getTime() < depTask.deadline.getTime()) {
      throw new ConnectError("Deadline must be greater than the dependencies deadline", Code.InvalidArgument);
    }
  }

  const isMember = await checkProjectMembership(task.projectId, ctx.user.id);
  if (!isMember) {
    throw new ConnectError("You are not a member of this project", Code.PermissionDenied);
  }

  const isCycle = await hasDependencyCycle(taskId, dependsOnTaskId);
  if (isCycle) {
    throw new ConnectError("Circular dependency detected. This dependency is not allowed.", Code.FailedPrecondition);
  }

  const existingDep = await prisma.taskDependency.findUnique({
    where: {
      taskId_dependsOnTaskId: { taskId, dependsOnTaskId }
    }
  });

  if (!existingDep) {
    await prisma.taskDependency.create({
      data: {
        id: generateUuidV7(),
        taskId,
        dependsOnTaskId
      }
    });
  }

  return create(AddTaskDependencyResponseSchema, {
    message: "Dependency added successfully"
  });
}
