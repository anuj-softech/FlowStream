import { create } from "@bufbuild/protobuf";
import { HandlerContext } from "@connectrpc/connect";
import { LogoutRequest, LogoutResponse, LogoutResponseSchema } from "../../gen/auth/v1/auth_pb.js";

export async function logout(_req: LogoutRequest, ctx: HandlerContext): Promise<LogoutResponse> {
  const isProd = process.env.NODE_ENV === "production";
  const cookieAttributes = isProd 
    ? "SameSite=Lax; Secure" 
    : "SameSite=Lax";

  ctx.responseHeader.set(
    "Set-Cookie",
    `auth_token=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieAttributes}`
  );
  return create(LogoutResponseSchema, {
    message: "Logged out successfully",
  });
}
