import { HandlerContext, ConnectError, Code } from "@connectrpc/connect";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedContext extends HandlerContext {
  user: {
    id: string;
    name: string;
  };
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key && key.trim() === name) {
      return value ? value.trim() : null;
    }
  }
  return null;
}

export function withAuth<TReq, TRes>(
  handler: (req: TReq, ctx: AuthenticatedContext) => Promise<TRes>
) {
  return async (req: TReq, ctx: HandlerContext): Promise<TRes> => {
    const cookieHeader = ctx.requestHeader.get("cookie");
    const token = parseCookie(cookieHeader, "auth_token");

    if (!token) {
      throw new ConnectError("Unauthenticated: Missing authentication session", Code.Unauthenticated);
    }
    if(!JWT_SECRET) throw new ConnectError("JWT_SECRET not configured", Code.Unauthenticated);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };
    } catch {
      throw new ConnectError("Unauthenticated: Invalid or expired session", Code.Unauthenticated);
    }

    const authCtx = ctx as AuthenticatedContext;
    authCtx.user = decoded;
    return await handler(req, authCtx);
  };
}
