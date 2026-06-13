import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { GetUserRequest, GetUserResponse, GetUserResponseSchema, UserSchema } from "../../gen/auth/v1/auth_pb.js";
import { prisma } from "../../prisma.js";
import { AuthenticatedContext } from "../../middleware/auth.js";
import { extractTimestampFromUuidV7 } from "../../utils/uuid.js";

export async function getUser(req: GetUserRequest, ctx: AuthenticatedContext): Promise<GetUserResponse> {
  const userId = ctx.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ConnectError("User not found", Code.NotFound);
  }

  const dateCreated = extractTimestampFromUuidV7(user.id).toISOString();

  return create(GetUserResponseSchema, {
    user: create(UserSchema, {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicUrl: user.profilePicUrl ?? undefined,
      profession: user.profession ?? undefined,
      mobileNumber: user.mobileNumber ?? undefined,
      dateCreated,
    }),
  });
}
