import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import { generateUuidV7 } from "../../utils/uuid.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  RespondToInviteRequest,
  RespondToInviteResponse,
  RespondToInviteResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function respondToInvite(
  req: RespondToInviteRequest,
  ctx: AuthenticatedContext
): Promise<RespondToInviteResponse> {
  const { inviteId, action } = req;
  if (!inviteId || !action) {
    throw new ConnectError("Invite ID and action are required", Code.InvalidArgument);
  }

  const invite = await prisma.projectInvite.findUnique({
    where: { id: inviteId }
  });

  if (!invite) {
    throw new ConnectError("Invitation not found", Code.NotFound);
  }

  if (invite.inviteeId !== ctx.user.id) {
    throw new ConnectError("You cannot respond to this invitation", Code.PermissionDenied);
  }

  if (action !== "ACCEPT" && action !== "DECLINE") {
    throw new ConnectError("Invalid action. Action must be ACCEPT or DECLINE", Code.InvalidArgument);
  }

  if (action === "ACCEPT") {
    await prisma.$transaction(async (tx) => {
      await tx.projectInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" }
      });

      // Avoid double member creations
      const memberExists = await tx.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: invite.projectId, userId: ctx.user.id }
        }
      });

      if (!memberExists) {
        await tx.projectMember.create({
          data: {
            id: generateUuidV7(),
            projectId: invite.projectId,
            userId: ctx.user.id,
            role: "MEMBER"
          }
        });
      }
    });
  } else {
    await prisma.projectInvite.update({
      where: { id: inviteId },
      data: { status: "DECLINED" }
    });
  }

  return create(RespondToInviteResponseSchema, {
    message: `Invitation ${action.toLowerCase()}ed successfully`
  });
}
