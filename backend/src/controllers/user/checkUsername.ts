import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { CheckUsernameRequest, CheckUsernameResponse, CheckUsernameResponseSchema } from "../../gen/auth/v1/auth_pb.js";
import { prisma } from "../../prisma.js";

export async function checkUsername(req: CheckUsernameRequest): Promise<CheckUsernameResponse> {
  const { username } = req;

  if (!username || username.trim() === "") {
    throw new ConnectError("Username is required", Code.InvalidArgument);
  }

  if (!/^[a-z0-9]+$/.test(username)) {
    throw new ConnectError("Username can only contain lowercase letters and numbers", Code.InvalidArgument);
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: username.toLowerCase().trim() },
  });

  return create(CheckUsernameResponseSchema, {
    available: !existingUser,
  });
}
