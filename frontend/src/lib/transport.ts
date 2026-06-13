import { browser } from "$app/environment";
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AuthService } from "$lib/gen/auth/v1/auth_pb.js";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  GetUserRequest,
  GetUserResponse,
  UpdateInfoRequest,
  UpdateInfoResponse,
  CheckUsernameRequest,
  CheckUsernameResponse,
  User
} from "$lib/gen/auth/v1/auth_pb.js";

import { client as authClient } from "./transport.js"; // to self-reference or check imports if needed
import { ProjectService } from "$lib/gen/project/v1/project_pb.js";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ListProjectsRequest,
  ListProjectsResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  SendInviteRequest,
  SendInviteResponse,
  ListInvitesRequest,
  ListInvitesResponse,
  RespondToInviteRequest,
  RespondToInviteResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskStatusRequest,
  UpdateTaskStatusResponse,
  AddTaskDependencyRequest,
  AddTaskDependencyResponse,
  GetProjectDetailsRequest,
  GetProjectDetailsResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  GetTaskDetailsRequest,
  GetTaskDetailsResponse,
  UpdateTaskRequest,
  UpdateTaskResponse
} from "$lib/gen/project/v1/project_pb.js";

const MOCK_API = import.meta.env.VITE_ENABLE_MOCKS === "true";

export interface AuthClient {
  register(req: Partial<RegisterRequest>): Promise<RegisterResponse>;
  login(req: Partial<LoginRequest>): Promise<LoginResponse>;
  logout(req?: Partial<LogoutRequest>): Promise<LogoutResponse>;
  getUser(req?: Partial<GetUserRequest>): Promise<GetUserResponse>;
  updateInfo(req: Partial<UpdateInfoRequest>): Promise<UpdateInfoResponse>;
  checkUsername(req: Partial<CheckUsernameRequest>): Promise<CheckUsernameResponse>;
}

export interface ProjectClient {
  createProject(req: Partial<CreateProjectRequest>): Promise<CreateProjectResponse>;
  listProjects(req?: Partial<ListProjectsRequest>): Promise<ListProjectsResponse>;
  searchUsers(req: Partial<SearchUsersRequest>): Promise<SearchUsersResponse>;
  sendInvite(req: Partial<SendInviteRequest>): Promise<SendInviteResponse>;
  listInvites(req?: Partial<ListInvitesRequest>): Promise<ListInvitesResponse>;
  respondToInvite(req: Partial<RespondToInviteRequest>): Promise<RespondToInviteResponse>;
  createTask(req: Partial<CreateTaskRequest>): Promise<CreateTaskResponse>;
  updateTaskStatus(req: Partial<UpdateTaskStatusRequest>): Promise<UpdateTaskStatusResponse>;
  addTaskDependency(req: Partial<AddTaskDependencyRequest>): Promise<AddTaskDependencyResponse>;
  getProjectDetails(req: Partial<GetProjectDetailsRequest>): Promise<GetProjectDetailsResponse>;
  updateProject(req: Partial<UpdateProjectRequest>): Promise<UpdateProjectResponse>;
  getTaskDetails(req: Partial<GetTaskDetailsRequest>): Promise<GetTaskDetailsResponse>;
  updateTask(req: Partial<UpdateTaskRequest>): Promise<UpdateTaskResponse>;
}

class RealAuthClient implements AuthClient {
  private innerClient;

  constructor() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || (browser ? window.location.origin : "http://localhost:3000");
    const transport = createConnectTransport({
      baseUrl,
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          credentials: "include"
        });
      }
    });
    this.innerClient = createClient(AuthService, transport);
  }

  async register(req: Partial<RegisterRequest>): Promise<RegisterResponse> {
    return await this.innerClient.register(req as any);
  }

  async login(req: Partial<LoginRequest>): Promise<LoginResponse> {
    return await this.innerClient.login(req as any);
  }

  async logout(req?: Partial<LogoutRequest>): Promise<LogoutResponse> {
    return await this.innerClient.logout(req as any);
  }

  async getUser(req?: Partial<GetUserRequest>): Promise<GetUserResponse> {
    return await this.innerClient.getUser(req as any);
  }

  async updateInfo(req: Partial<UpdateInfoRequest>): Promise<UpdateInfoResponse> {
    return await this.innerClient.updateInfo(req as any);
  }

  async checkUsername(req: Partial<CheckUsernameRequest>): Promise<CheckUsernameResponse> {
    return await this.innerClient.checkUsername(req as any);
  }
}

class RealProjectClient implements ProjectClient {
  private innerClient;

  constructor() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || (browser ? window.location.origin : "http://localhost:3000");
    const transport = createConnectTransport({
      baseUrl,
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          credentials: "include"
        });
      }
    });
    this.innerClient = createClient(ProjectService, transport);
  }

  async createProject(req: Partial<CreateProjectRequest>): Promise<CreateProjectResponse> {
    return await this.innerClient.createProject(req as any);
  }

  async listProjects(req?: Partial<ListProjectsRequest>): Promise<ListProjectsResponse> {
    return await this.innerClient.listProjects(req as any);
  }

  async searchUsers(req: Partial<SearchUsersRequest>): Promise<SearchUsersResponse> {
    return await this.innerClient.searchUsers(req as any);
  }

  async sendInvite(req: Partial<SendInviteRequest>): Promise<SendInviteResponse> {
    return await this.innerClient.sendInvite(req as any);
  }

  async listInvites(req?: Partial<ListInvitesRequest>): Promise<ListInvitesResponse> {
    return await this.innerClient.listInvites(req as any);
  }

  async respondToInvite(req: Partial<RespondToInviteRequest>): Promise<RespondToInviteResponse> {
    return await this.innerClient.respondToInvite(req as any);
  }

  async createTask(req: Partial<CreateTaskRequest>): Promise<CreateTaskResponse> {
    return await this.innerClient.createTask(req as any);
  }

  async updateTaskStatus(req: Partial<UpdateTaskStatusRequest>): Promise<UpdateTaskStatusResponse> {
    return await this.innerClient.updateTaskStatus(req as any);
  }

  async addTaskDependency(req: Partial<AddTaskDependencyRequest>): Promise<AddTaskDependencyResponse> {
    return await this.innerClient.addTaskDependency(req as any);
  }

  async getProjectDetails(req: Partial<GetProjectDetailsRequest>): Promise<GetProjectDetailsResponse> {
    return await this.innerClient.getProjectDetails(req as any);
  }

  async updateProject(req: Partial<UpdateProjectRequest>): Promise<UpdateProjectResponse> {
    return await this.innerClient.updateProject(req as any);
  }

  async getTaskDetails(req: Partial<GetTaskDetailsRequest>): Promise<GetTaskDetailsResponse> {
    return await this.innerClient.getTaskDetails(req as any);
  }

  async updateTask(req: Partial<UpdateTaskRequest>): Promise<UpdateTaskResponse> {
    return await this.innerClient.updateTask(req as any);
  }
}

class MockAuthClient implements AuthClient {
  private getUsers(): User[] {
    if (!browser) return [];
    const stored = localStorage.getItem("mock_users");
    return stored ? JSON.parse(stored) : [];
  }

  private saveUsers(users: User[]): void {
    if (!browser) return;
    localStorage.setItem("mock_users", JSON.stringify(users));
  }

  private getCurrentToken(): string | null {
    if (!browser) return null;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key && key.trim() === "auth_token") {
        return value ? value.trim() : null;
      }
    }
    return null;
  }

  async register(req: Partial<RegisterRequest>): Promise<RegisterResponse> {
    const users = this.getUsers();
    if (users.some(u => u.email === req.email)) {
      throw new Error("Email address already registered");
    }
    if (users.some(u => u.username === req.username)) {
      throw new Error("Username already taken");
    }
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      name: req.name || "",
      username: req.username || "",
      email: req.email || "",
      profilePicUrl: req.profilePicUrl || "",
      profession: req.profession || "",
      mobileNumber: req.mobileNumber || "",
      dateCreated: new Date().toISOString()
    } as any;
    users.push(newUser);
    this.saveUsers(users);
    return { message: "Account created successfully" } as any;
  }

  async login(req: Partial<LoginRequest>): Promise<LoginResponse> {
    const users = this.getUsers();
    const user = users.find(u => u.email === req.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const token = "mock-jwt-" + user.id;
    if (browser) {
      document.cookie = `auth_token=${token}; Path=/; Max-Age=604800; SameSite=Lax`;
    }
    return { token, message: "Welcome back" } as any;
  }

  async logout(): Promise<LogoutResponse> {
    if (browser) {
      document.cookie = "auth_token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
    return { message: "Logged out successfully" } as any;
  }

  async getUser(): Promise<GetUserResponse> {
    const token = this.getCurrentToken();
    if (!token || !token.startsWith("mock-jwt-")) {
      throw new Error("Session expired or unauthorized");
    }
    const userId = token.replace("mock-jwt-", "");
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return { user } as any;
  }

  async updateInfo(req: Partial<UpdateInfoRequest>): Promise<UpdateInfoResponse> {
    const token = this.getCurrentToken();
    if (!token || !token.startsWith("mock-jwt-")) {
      throw new Error("Unauthorized update request");
    }
    const userId = token.replace("mock-jwt-", "");
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error("User profile not found");
    }
    const user = users[index];
    if (req.username && req.username !== user.username && users.some(u => u.username === req.username)) {
      throw new Error("Username already in use");
    }
    const updatedUser: User = {
      ...user,
      name: req.name !== undefined ? req.name : user.name,
      username: req.username !== undefined ? req.username : user.username,
      profilePicUrl: req.profilePicUrl !== undefined ? req.profilePicUrl : user.profilePicUrl,
      profession: req.profession !== undefined ? req.profession : user.profession,
      mobileNumber: req.mobileNumber !== undefined ? req.mobileNumber : user.mobileNumber
    } as any;
    users[index] = updatedUser;
    this.saveUsers(users);
    return { user: updatedUser } as any;
  }

  async checkUsername(req: Partial<CheckUsernameRequest>): Promise<CheckUsernameResponse> {
    const users = this.getUsers();
    const taken = users.some(u => u.username === req.username);
    return { available: !taken } as any;
  }
}

class MockProjectClient implements ProjectClient {
  private getStorage<T>(key: string): T[] {
    if (!browser) return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveStorage<T>(key: string, data: T[]): void {
    if (!browser) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  async createProject(req: Partial<CreateProjectRequest>): Promise<CreateProjectResponse> {
    const projects = this.getStorage<any>("mock_projects");
    const newProject = {
      id: "proj_" + Math.random().toString(36).substring(2, 11),
      name: req.name || "New Project",
      description: req.description || "",
      createdAt: new Date().toISOString(),
      adminId: "mock-admin"
    };
    projects.push(newProject);
    this.saveStorage("mock_projects", projects);

    const members = this.getStorage<any>("mock_members");
    members.push({
      id: "mem_" + Math.random().toString(36).substring(2, 11),
      projectId: newProject.id,
      userId: "mock-admin",
      role: "ADMIN",
      joinedAt: new Date().toISOString()
    });
    this.saveStorage("mock_members", members);

    return { project: newProject, message: "Project created" } as any;
  }

  async listProjects(): Promise<ListProjectsResponse> {
    const projects = this.getStorage<any>("mock_projects");
    return { projects } as any;
  }

  async searchUsers(req: Partial<SearchUsersRequest>): Promise<SearchUsersResponse> {
    const query = req.query?.toLowerCase() || "";
    const users = this.getStorage<any>("mock_users");
    const results = users.filter(
      (u: any) => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
    );
    return { users: results } as any;
  }

  async sendInvite(req: Partial<SendInviteRequest>): Promise<SendInviteResponse> {
    const invites = this.getStorage<any>("mock_invites");
    invites.push({
      id: "inv_" + Math.random().toString(36).substring(2, 11),
      projectId: req.projectId,
      inviterId: "mock-admin",
      inviteeId: req.inviteeId,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });
    this.saveStorage("mock_invites", invites);
    return { message: "Invite sent" } as any;
  }

  async listInvites(): Promise<ListInvitesResponse> {
    const invites = this.getStorage<any>("mock_invites");
    const projects = this.getStorage<any>("mock_projects");
    const pending = invites.filter((i: any) => i.inviteeId === "mock-admin" && i.status === "PENDING");
    const populated = pending.map((i: any) => {
      const proj = projects.find((p: any) => p.id === i.projectId);
      return {
        id: i.id,
        projectId: i.projectId,
        projectName: proj ? proj.name : "Unknown Project",
        inviterName: "Project Owner",
        status: i.status,
        createdAt: i.createdAt
      };
    });
    return { invites: populated } as any;
  }

  async respondToInvite(req: Partial<RespondToInviteRequest>): Promise<RespondToInviteResponse> {
    const invites = this.getStorage<any>("mock_invites");
    const idx = invites.findIndex((i: any) => i.id === req.inviteId);
    if (idx !== -1) {
      invites[idx].status = req.action;
      this.saveStorage("mock_invites", invites);

      if (req.action === "ACCEPT") {
        const members = this.getStorage<any>("mock_members");
        members.push({
          id: "mem_" + Math.random().toString(36).substring(2, 11),
          projectId: invites[idx].projectId,
          userId: "mock-admin",
          role: "MEMBER",
          joinedAt: new Date().toISOString()
        });
        this.saveStorage("mock_members", members);
      }
    }
    return { message: "Response submitted" } as any;
  }

  async createTask(req: Partial<CreateTaskRequest>): Promise<CreateTaskResponse> {
    const tasks = this.getStorage<any>("mock_tasks");
    const newTask = {
      id: "tsk_" + Math.random().toString(36).substring(2, 11),
      projectId: req.projectId,
      title: req.title || "",
      description: req.description || "",
      deadline: req.deadline || "",
      status: "TODO",
      priority: req.priority || "MEDIUM",
      parentId: req.parentId || "",
      createdById: "mock-admin",
      createdAt: new Date().toISOString(),
      assignees: [],
      dependsOnTaskIds: req.dependsOnTaskIds || []
    };
    tasks.push(newTask);
    this.saveStorage("mock_tasks", tasks);
    return { task: newTask, message: "Task created" } as any;
  }

  async updateTaskStatus(req: Partial<UpdateTaskStatusRequest>): Promise<UpdateTaskStatusResponse> {
    const tasks = this.getStorage<any>("mock_tasks");
    const idx = tasks.findIndex((t: any) => t.id === req.taskId);
    if (idx !== -1) {
      tasks[idx].status = req.status;
      this.saveStorage("mock_tasks", tasks);
    }
    return { task: tasks[idx], message: "Status updated" } as any;
  }

  async addTaskDependency(req: Partial<AddTaskDependencyRequest>): Promise<AddTaskDependencyResponse> {
    const tasks = this.getStorage<any>("mock_tasks");
    const idx = tasks.findIndex((t: any) => t.id === req.taskId);
    if (idx !== -1) {
      if (!tasks[idx].dependsOnTaskIds) tasks[idx].dependsOnTaskIds = [];
      tasks[idx].dependsOnTaskIds.push(req.dependsOnTaskId);
      this.saveStorage("mock_tasks", tasks);
    }
    return { message: "Dependency added" } as any;
  }

  async getProjectDetails(req: Partial<GetProjectDetailsRequest>): Promise<GetProjectDetailsResponse> {
    const projects = this.getStorage<any>("mock_projects");
    const members = this.getStorage<any>("mock_members");
    const tasks = this.getStorage<any>("mock_tasks");

    const proj = projects.find((p: any) => p.id === req.projectId);
    const projMembers = members.filter((m: any) => m.projectId === req.projectId);
    const projTasks = tasks.filter((t: any) => t.projectId === req.projectId);

    return {
      project: proj,
      members: projMembers,
      tasks: projTasks
    } as any;
  }

  async updateProject(req: Partial<UpdateProjectRequest>): Promise<UpdateProjectResponse> {
    const projects = this.getStorage<any>("mock_projects");
    const idx = projects.findIndex((p: any) => p.id === req.id);
    if (idx !== -1) {
      if (req.name) projects[idx].name = req.name;
      if (req.description !== undefined) projects[idx].description = req.description;
      this.saveStorage("mock_projects", projects);
    }
    return { project: projects[idx], message: "Project updated" } as any;
  }

  async getTaskDetails(req: Partial<GetTaskDetailsRequest>): Promise<GetTaskDetailsResponse> {
    const tasks = this.getStorage<any>("mock_tasks");
    const task = tasks.find((t: any) => t.id === req.taskId);
    return { task } as any;
  }

  async updateTask(req: Partial<UpdateTaskRequest>): Promise<UpdateTaskResponse> {
    const tasks = this.getStorage<any>("mock_tasks");
    const idx = tasks.findIndex((t: any) => t.id === req.taskId);
    if (idx !== -1) {
      const t = tasks[idx];
      if (req.title !== undefined) t.title = req.title;
      if (req.description !== undefined) t.description = req.description;
      if (req.deadline !== undefined) t.deadline = req.deadline;
      if (req.priority !== undefined) t.priority = req.priority;
      if (req.parentId !== undefined) t.parentId = req.parentId;
      if (req.status !== undefined) t.status = req.status;
      if (req.assigneeIds !== undefined) {
        const users = this.getStorage<any>("mock_users") || [];
        t.assignees = users.filter((u: any) => req.assigneeIds!.includes(u.id));
      }
      if (req.dependsOnTaskIds !== undefined) {
        t.dependsOnTaskIds = req.dependsOnTaskIds;
      }
      this.saveStorage("mock_tasks", tasks);
    }
    return { task: tasks[idx], message: "Task updated" } as any;
  }
}

export const client: AuthClient = MOCK_API ? new MockAuthClient() : new RealAuthClient();
export const projectClient: ProjectClient = MOCK_API ? new MockProjectClient() : new RealProjectClient();
