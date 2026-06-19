import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  UpdateProjectRequest,
  UpdateProjectResponse,
  UpdateProjectResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function updateProject(
  req: UpdateProjectRequest,
  ctx: AuthenticatedContext
): Promise<UpdateProjectResponse> {
  const { id, name, description } = req;
  if (!id) {
    throw new ConnectError("Project ID is required", Code.InvalidArgument);
  }
  if (!name || !name.trim()) {
    throw new ConnectError("Project name is required", Code.InvalidArgument);
  }
  if (name.length > 100) {
    throw new ConnectError("Project name cannot exceed 100 characters", Code.InvalidArgument);
  }
  if (description && description.length > 10000) {
    throw new ConnectError("Project description cannot exceed 10000 characters", Code.InvalidArgument);
  }

  const project = await prisma.project.findUnique({
    where: { id }
  });

  if (!project) {
    throw new ConnectError("Project not found", Code.NotFound);
  }

  if (project.adminId !== ctx.user.id) {
    throw new ConnectError("Permission denied: only admin can edit project details", Code.PermissionDenied);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description !== undefined ? (description.trim() || null) : project.description
    }
  });

  return create(UpdateProjectResponseSchema, {
    project: {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description || undefined,
      createdAt: updatedProject.createdAt.toISOString(),
      adminId: updatedProject.adminId
    },
    message: "Project details updated successfully"
  });
}
