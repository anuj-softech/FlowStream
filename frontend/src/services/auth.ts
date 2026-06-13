import { client } from "$lib/transport.js";
import type { RegisterRequest, LoginRequest, UpdateInfoRequest } from "$lib/gen/auth/v1/auth_pb.js";

export const AuthService = {
  async register(req: Partial<RegisterRequest>) {
    return await client.register(req);
  },

  async login(req: Partial<LoginRequest>) {
    return await client.login(req);
  },

  async logout() {
    return await client.logout();
  },

  async getUser() {
    return await client.getUser();
  },

  async updateInfo(req: Partial<UpdateInfoRequest>) {
    return await client.updateInfo(req);
  },

  async checkUsername(username: string) {
    return await client.checkUsername({ username });
  }
};
