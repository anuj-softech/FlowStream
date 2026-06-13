import { ConnectError, Code, HandlerContext } from "@connectrpc/connect";
import jwt from "jsonwebtoken";
import { create } from "@bufbuild/protobuf";
import { LoginRequest, LoginResponse, LoginResponseSchema } from "../../gen/auth/v1/auth_pb.js";
import { prisma } from "../../prisma.js";
import { verifyPassword } from "../../utils/password.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export async function login(req: LoginRequest, ctx: HandlerContext): Promise<LoginResponse> {
  const { email, password } = req;

  if (!email || !password) {
    throw new ConnectError("Email and password are required", Code.InvalidArgument);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ConnectError("Invalid email or password", Code.Unauthenticated);
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ConnectError("Invalid email or password", Code.Unauthenticated);
  }

  const token = jwt.sign(
    { id: user.id, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const isProd = process.env.NODE_ENV === "production";
  const cookieAttributes = isProd 
    ? "SameSite=Lax; Secure" 
    : "SameSite=Lax";

  ctx.responseHeader.set(
    "Set-Cookie",
    `auth_token=${token}; Path=/; HttpOnly; Max-Age=604800; ${cookieAttributes}`
  );

  return create(LoginResponseSchema, {
    token,
    message: "Logged in successfully",
  });
}
