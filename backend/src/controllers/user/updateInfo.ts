import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { UpdateInfoRequest, UpdateInfoResponse, UpdateInfoResponseSchema, UserSchema } from "../../gen/auth/v1/auth_pb.js";
import { prisma } from "../../prisma.js";
import { AuthenticatedContext } from "../../middleware/auth.js";
import { extractTimestampFromUuidV7 } from "../../utils/uuid.js";

export async function updateInfo(req: UpdateInfoRequest, ctx: AuthenticatedContext): Promise<UpdateInfoResponse> {
  const userId = ctx.user.id;
  const { name, username, profilePicUrl, profession, mobileNumber } = req;

  const updateData: {
    name?: string;
    username?: string;
    profilePicUrl?: string | null;
    profession?: string | null;
    mobileNumber?: string | null;
  } = {};

  if (name !== undefined) {
    if (name.length > 100) {
      throw new ConnectError("Name cannot exceed 100 characters", Code.InvalidArgument);
    }
    updateData.name = name;
  }

  if (username !== undefined) {
    if (!username || username.trim() === "") {
      throw new ConnectError("Username cannot be empty", Code.InvalidArgument);
    }
    if (username.length > 100) {
      throw new ConnectError("Username cannot exceed 100 characters", Code.InvalidArgument);
    }
    if (!/^[a-z0-9]+$/.test(username)) {
      throw new ConnectError("Username can only contain lowercase letters and numbers", Code.InvalidArgument);
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    });
    if (existingUser) {
      throw new ConnectError("Username is already taken", Code.AlreadyExists);
    }
    updateData.username = username;
  }

  if (profilePicUrl !== undefined) {
    if (profilePicUrl && profilePicUrl.length > 10000) {
      throw new ConnectError("Profile picture URL cannot exceed 10000 characters", Code.InvalidArgument);
    }
    updateData.profilePicUrl = profilePicUrl || null;
  }

  if (profession !== undefined) {
    if (profession && profession.length > 100) {
      throw new ConnectError("Profession cannot exceed 100 characters", Code.InvalidArgument);
    }
    updateData.profession = profession || null;
  }

  if (mobileNumber !== undefined) {
    if (mobileNumber && mobileNumber.length > 100) {
      throw new ConnectError("Mobile number cannot exceed 100 characters", Code.InvalidArgument);
    }
    updateData.mobileNumber = mobileNumber || null;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const dateCreated = extractTimestampFromUuidV7(updatedUser.id).toISOString();

  return create(UpdateInfoResponseSchema, {
    user: create(UserSchema, {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePicUrl: updatedUser.profilePicUrl ?? undefined,
      profession: updatedUser.profession ?? undefined,
      mobileNumber: updatedUser.mobileNumber ?? undefined,
      dateCreated,
    }),
  });
}
