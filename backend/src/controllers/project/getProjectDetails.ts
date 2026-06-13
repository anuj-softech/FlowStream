import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import { checkProjectMembership } from "./helpers.js";
import {
  GetProjectDetailsRequest,
  GetProjectDetailsResponse,
  GetProjectDetailsResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function getProjectDetails(
  req: GetProjectDetailsRequest,
  ctx: AuthenticatedContext
): Promise<GetProjectDetailsResponse> {
  const { projectId } = req;
  if (!projectId) {
    throw new ConnectError("Project ID is required", Code.InvalidArgument);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new ConnectError("Project not found", Code.NotFound);
  }

  const isMember = await checkProjectMembership(projectId, ctx.user.id);
  if (!isMember) {
    throw new ConnectError("You are not a member of this project", Code.PermissionDenied);
  }

  const dbMembers = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: true }
  });

  const dbTasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignees: { include: { user: true } },
      dependencies: true
    }
  });

  const members = dbMembers.map((m) => ({
    id: m.id,
    projectId: m.projectId,
    user: {
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      email: m.user.email,
      profilePicUrl: m.user.profilePicUrl || undefined,
      profession: m.user.profession || undefined,
      mobileNumber: m.user.mobileNumber || undefined,
      dateCreated: ""
    },
    role: m.role,
    joinedAt: m.joinedAt.toISOString()
  }));

  const tasks = dbTasks.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description || undefined,
    deadline: t.deadline ? t.deadline.toISOString() : undefined,
    status: t.status,
    priority: t.priority,
    parentId: t.parentId || undefined,
    createdById: t.createdById,
    createdAt: t.createdAt.toISOString(),
    assignees: t.assignees.map((a) => ({
      id: a.user.id,
      name: a.user.name,
      username: a.user.username,
      email: a.user.email,
      profilePicUrl: a.user.profilePicUrl || undefined,
      profession: a.user.profession || undefined,
      mobileNumber: a.user.mobileNumber || undefined,
      dateCreated: ""
    })),
    dependsOnTaskIds: t.dependencies.map((d) => d.dependsOnTaskId)
  }));

  return create(GetProjectDetailsResponseSchema, {
    project: {
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      createdAt: project.createdAt.toISOString(),
      adminId: project.adminId
    },
    members,
    tasks
  });
}
