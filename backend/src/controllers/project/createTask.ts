import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import { generateUuidV7 } from "../../utils/uuid.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import { checkProjectMembership } from "./helpers.js";
import {
  CreateTaskRequest,
  CreateTaskResponse,
  CreateTaskResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function createTask(
  req: CreateTaskRequest,
  ctx: AuthenticatedContext
): Promise<CreateTaskResponse> {
  const { projectId, title, description, deadline, priority, parentId, assigneeIds, dependsOnTaskIds } = req;

  if (!projectId || !title || !title.trim()) {
    throw new ConnectError("Project ID and title are required", Code.InvalidArgument);
  }

  if (title.length > 100) {
    throw new ConnectError("Task title cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (description && description.length > 10000) {
    throw new ConnectError("Task description cannot exceed 10000 characters", Code.InvalidArgument);
  }

  const isMember = await checkProjectMembership(projectId, ctx.user.id);
  if (!isMember) {
    throw new ConnectError("You are not a member of this project", Code.PermissionDenied);
  }

  // Verify parent task exists in same project
  if (parentId) {
    const parentTask = await prisma.task.findUnique({ where: { id: parentId } });
    if (!parentTask || parentTask.projectId !== projectId) {
      throw new ConnectError("Parent task not found in this project", Code.InvalidArgument);
    }
  }

  const taskId = generateUuidV7();
  const task = await prisma.$transaction(async (tx) => {
    // Create the task
    const t = await tx.task.create({
      data: {
        id: taskId,
        projectId: projectId,
        title,
        description: description || null,
        deadline: deadline ? new Date(deadline) : null,
        status: "TODO",
        priority: (priority || "MEDIUM") as any,
        parentId: parentId || null,
        createdById: ctx.user.id
      }
    });

    // Create assignees
    if (assigneeIds && assigneeIds.length > 0) {
      for (const uid of assigneeIds) {
        const isAssigneeMember = await tx.projectMember.findUnique({
          where: { projectId_userId: { projectId: projectId, userId: uid } }
        });
        if (!isAssigneeMember) {
          throw new ConnectError(`User ${uid} is not a member of this project`, Code.InvalidArgument);
        }

        await tx.taskAssignee.create({
          data: {
            id: generateUuidV7(),
            taskId,
            userId: uid
          }
        });
      }
    }

    // Create dependencies
    if (dependsOnTaskIds && dependsOnTaskIds.length > 0) {
      for (const depId of dependsOnTaskIds) {
        const depTask = await tx.task.findUnique({ where: { id: depId } });
        if (!depTask || depTask.projectId !== projectId) {
          throw new ConnectError(`Dependency task ${depId} does not exist in this project`, Code.InvalidArgument);
        }

        await tx.taskDependency.create({
          data: {
            id: generateUuidV7(),
            taskId,
            dependsOnTaskId: depId
          }
        });
      }
    }

    return t;
  });

  // Fetch full details back
  const fullTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { include: { user: true } },
      dependencies: true
    }
  });

  if (!fullTask) {
    throw new ConnectError("Failed to fetch created task details", Code.Internal);
  }

  return create(CreateTaskResponseSchema, {
    task: {
      id: fullTask.id,
      projectId: fullTask.projectId,
      title: fullTask.title,
      description: fullTask.description || undefined,
      deadline: fullTask.deadline ? fullTask.deadline.toISOString() : undefined,
      status: fullTask.status,
      priority: fullTask.priority,
      parentId: fullTask.parentId || undefined,
      createdById: fullTask.createdById,
      createdAt: fullTask.createdAt.toISOString(),
      assignees: fullTask.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        username: a.user.username,
        email: a.user.email,
        profilePicUrl: a.user.profilePicUrl || undefined,
        profession: a.user.profession || undefined,
        mobileNumber: a.user.mobileNumber || undefined,
        dateCreated: ""
      })),
      dependsOnTaskIds: fullTask.dependencies.map((d) => d.dependsOnTaskId)
    },
    message: "Task created successfully"
  });
}
