import { ConnectError, Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { RegisterRequest, RegisterResponse, RegisterResponseSchema } from "../../gen/auth/v1/auth_pb.js";
import { prisma } from "../../prisma.js";
import { hashPassword } from "../../utils/password.js";
import { generateUuidV7 } from "../../utils/uuid.js";

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  const { name, email, password, username, profilePicUrl, profession, mobileNumber } = req;

  if (!name || !email || !password || !username) {
    throw new ConnectError("Name, email, password, and username are required", Code.InvalidArgument);
  }

  if (name.length > 100) {
    throw new ConnectError("Name cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (username.length > 100) {
    throw new ConnectError("Username cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (!/^[a-z0-9]+$/.test(username)) {
    throw new ConnectError("Username can only contain lowercase letters and numbers", Code.InvalidArgument);
  }

  if (email.length > 100) {
    throw new ConnectError("Email cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ConnectError("Invalid email address format", Code.InvalidArgument);
  }

  if (password.length < 8) {
    throw new ConnectError("Password must be at least 8 characters long", Code.InvalidArgument);
  }

  if (password.length > 100) {
    throw new ConnectError("Password cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (profession && profession.length > 100) {
    throw new ConnectError("Profession cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (mobileNumber && mobileNumber.length > 100) {
    throw new ConnectError("Mobile number cannot exceed 100 characters", Code.InvalidArgument);
  }

  if (profilePicUrl && profilePicUrl.length > 10000) {
    throw new ConnectError("Profile picture URL cannot exceed 10000 characters", Code.InvalidArgument);
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new ConnectError("Email is already registered", Code.AlreadyExists);
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new ConnectError("Username is already taken", Code.AlreadyExists);
  }

  const passwordHash = await hashPassword(password);
  const id = generateUuidV7();

  await prisma.user.create({
    data: {
      id,
      name,
      email,
      username,
      passwordHash,
      profilePicUrl: profilePicUrl || null,
      profession: profession || null,
      mobileNumber: mobileNumber || null,
    },
  });

  return create(RegisterResponseSchema, {
    message: "Account created successfully. Please login using your password."
  });
}
