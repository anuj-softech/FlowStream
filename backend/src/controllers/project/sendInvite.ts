import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import { generateUuidV7 } from "../../utils/uuid.js";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import { checkProjectMembership } from "./helpers.js";
import {
  SendInviteRequest,
  SendInviteResponse,
  SendInviteResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function sendInvite(
  req: SendInviteRequest,
  ctx: AuthenticatedContext
): Promise<SendInviteResponse> {
  const { projectId, inviteeId } = req;
  if (!projectId || !inviteeId) {
    throw new ConnectError("Project ID and invitee ID are required", Code.InvalidArgument);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new ConnectError("Project not found", Code.NotFound);
  }

  if (project.adminId !== ctx.user.id) {
    throw new ConnectError("Only the project admin can send invitations", Code.PermissionDenied);
  }

  const isMember = await checkProjectMembership(projectId, inviteeId);
  if (isMember) {
    throw new ConnectError("User is already a member of this project", Code.AlreadyExists);
  }

  const existingInvite = await prisma.projectInvite.findUnique({
    where: {
      projectId_inviteeId: { projectId, inviteeId }
    }
  });

  if (existingInvite && existingInvite.status === "PENDING") {
    throw new ConnectError("Invitation has already been sent and is pending", Code.AlreadyExists);
  }

  await prisma.projectInvite.upsert({
    where: {
      projectId_inviteeId: { projectId, inviteeId }
    },
    create: {
      id: generateUuidV7(),
      projectId,
      inviterId: ctx.user.id,
      inviteeId,
      status: "PENDING"
    },
    update: {
      status: "PENDING"
    }
  });

  return create(SendInviteResponseSchema, {
    message: "Invitation sent successfully"
  });
}
