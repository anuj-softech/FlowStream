import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import { generateUuidV7 } from "../../utils/uuid.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  CreateProjectRequest,
  CreateProjectResponse,
  CreateProjectResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function createProject(
  req: CreateProjectRequest,
  ctx: AuthenticatedContext
): Promise<CreateProjectResponse> {
  const { name, description } = req;
  if (!name || !name.trim()) {
    throw new ConnectError("Project name is required", Code.InvalidArgument);
  }
  if (name.length > 100) {
    throw new ConnectError("Project name cannot exceed 100 characters", Code.InvalidArgument);
  }
  if (description && description.length > 10000) {
    throw new ConnectError("Project description cannot exceed 10000 characters", Code.InvalidArgument);
  }

  const projectId = generateUuidV7();
  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        id: projectId,
        name,
        description: description || null,
        adminId: ctx.user.id
      }
    });

    await tx.projectMember.create({
      data: {
        id: generateUuidV7(),
        projectId,
        userId: ctx.user.id,
        role: "ADMIN"
      }
    });

    return p;
  });

  return create(CreateProjectResponseSchema, {
    project: {
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      createdAt: project.createdAt.toISOString(),
      adminId: project.adminId
    },
    message: "Project created successfully"
  });
}
