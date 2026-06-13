import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  ListProjectsRequest,
  ListProjectsResponse,
  ListProjectsResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function listProjects(
  _req: ListProjectsRequest,
  ctx: AuthenticatedContext
): Promise<ListProjectsResponse> {
  const memberships = await prisma.projectMember.findMany({
    where: { userId: ctx.user.id },
    include: { project: true }
  });

  const projects = memberships.map((m) => ({
    id: m.project.id,
    name: m.project.name,
    description: m.project.description || undefined,
    createdAt: m.project.createdAt.toISOString(),
    adminId: m.project.adminId
  }));

  return create(ListProjectsResponseSchema, { projects });
}
