import { client } from "$lib/transport.js";
import type { User, RegisterRequest, UpdateInfoRequest } from "$lib/gen/auth/v1/auth_pb.js";

function cleanErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  let msg = err.message || String(err);
  msg = msg.replace(/^\[[a-z_]+\]\s*/i, "");
  if (!msg || msg.toLowerCase() === "error") {
    return fallback;
  }
  return msg.charAt(0).toUpperCase() + msg.slice(1);
}

class AuthStore {
  private _currentUser = $state<User | null>(null);
  private _loading = $state<boolean>(false);
  private _error = $state<string | null>(null);
  private _initialized = $state<boolean>(false);

  get currentUser() {
    return this._currentUser;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }

  get initialized() {
    return this._initialized;
  }

  clearError() {
    this._error = null;
  }

  async checkAuth(): Promise<boolean> {
    this._loading = true;
    this._error = null;
    try {
      const res = await client.getUser();
      this._currentUser = res.user || null;
      return true;
    } catch (err: any) {
      this._currentUser = null;
      this._error = cleanErrorMessage(err, "Please sign in to continue");
      return false;
    } finally {
      this._loading = false;
      this._initialized = true;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    this._loading = true;
    this._error = null;
    try {
      await client.login({ email, password });
      const success = await this.checkAuth();
      return success;
    } catch (err: any) {
      this._error = cleanErrorMessage(err, "Could not verify credentials");
      return false;
    } finally {
      this._loading = false;
    }
  }

  async register(req: Partial<RegisterRequest>): Promise<boolean> {
    this._loading = true;
    this._error = null;
    try {
      await client.register(req);
      return true;
    } catch (err: any) {
      this._error = cleanErrorMessage(err, "Could not register your account");
      return false;
    } finally {
      this._loading = false;
    }
  }

  async logout(): Promise<void> {
    this._loading = true;
    try {
      await client.logout();
    } catch {
    } finally {
      this._currentUser = null;
      this._loading = false;
    }
  }

  async updateProfile(req: Partial<UpdateInfoRequest>): Promise<boolean> {
    this._loading = true;
    this._error = null;
    try {
      const res = await client.updateInfo(req);
      if (res.user) {
        this._currentUser = res.user;
        return true;
      }
      return false;
    } catch (err: any) {
      this._error = cleanErrorMessage(err, "Could not update your profile");
      return false;
    } finally {
      this._loading = false;
    }
  }

  async checkUsername(username: string): Promise<boolean> {
    try {
      const res = await client.checkUsername({ username });
      return res.available;
    } catch {
      return false;
    }
  }
}

export const auth = new AuthStore();
