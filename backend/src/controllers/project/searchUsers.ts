import { HandlerContext } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { prisma } from "../../prisma.js";
import {
  SearchUsersRequest,
  SearchUsersResponse,
  SearchUsersResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function searchUsers(
  req: SearchUsersRequest,
  _ctx: HandlerContext
): Promise<SearchUsersResponse> {
  const { query } = req;
  if (!query) {
    return create(SearchUsersResponseSchema, { users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } }
      ]
    },
    take: 20
  });

  return create(SearchUsersResponseSchema, {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      profilePicUrl: u.profilePicUrl || undefined,
      profession: u.profession || undefined,
      mobileNumber: u.mobileNumber || undefined,
      dateCreated: ""
    }))
  });
}
