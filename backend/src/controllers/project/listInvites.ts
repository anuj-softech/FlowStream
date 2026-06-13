import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  ListInvitesRequest,
  ListInvitesResponse,
  ListInvitesResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function listInvites(
  _req: ListInvitesRequest,
  ctx: AuthenticatedContext
): Promise<ListInvitesResponse> {
  const dbInvites = await prisma.projectInvite.findMany({
    where: { inviteeId: ctx.user.id, status: "PENDING" },
    include: {
      project: true,
      inviter: true
    }
  });

  const invites = dbInvites.map((i) => ({
    id: i.id,
    projectId: i.projectId,
    projectName: i.project.name,
    inviterName: i.inviter.name,
    status: i.status,
    createdAt: i.createdAt.toISOString()
  }));

  return create(ListInvitesResponseSchema, { invites });
}
