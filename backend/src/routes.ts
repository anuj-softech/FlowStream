import { ConnectRouter } from "@connectrpc/connect";
import { AuthService } from "./gen/auth/v1/auth_pb.js";
import { ProjectService } from "./gen/project/v1/project_pb.js";
import { ChatBotService } from "./gen/chatbot/v1/chatbot_pb.js";

// Controllers
import { register } from "./controllers/auth/register.js";
import { login } from "./controllers/auth/login.js";
import { logout } from "./controllers/auth/logout.js";
import { getUser } from "./controllers/user/getUser.js";
import { updateInfo } from "./controllers/user/updateInfo.js";
import { checkUsername } from "./controllers/user/checkUsername.js";
import {
  createProject,
  listProjects,
  searchUsers,
  sendInvite,
  listInvites,
  respondToInvite,
  createTask,
  updateTaskStatus,
  addTaskDependency,
  getProjectDetails,
  updateProject,
  getTaskDetails,
  updateTask
} from "./controllers/project/index.js";
import { chat } from "./controllers/chatbot/index.js";

// Middleware
import { withAuth } from "./middleware/auth.js";

export default (router: ConnectRouter): void => {
  router.service(AuthService, {
    register,
    login,
    logout,
    getUser: withAuth(getUser),
    updateInfo: withAuth(updateInfo),
    checkUsername,
  });

  router.service(ProjectService, {
    createProject: withAuth(createProject),
    listProjects: withAuth(listProjects),
    searchUsers: withAuth(searchUsers),
    sendInvite: withAuth(sendInvite),
    listInvites: withAuth(listInvites),
    respondToInvite: withAuth(respondToInvite),
    createTask: withAuth(createTask),
    updateTaskStatus: withAuth(updateTaskStatus),
    addTaskDependency: withAuth(addTaskDependency),
    getProjectDetails: withAuth(getProjectDetails),
    updateProject: withAuth(updateProject),
    getTaskDetails: withAuth(getTaskDetails),
    updateTask: withAuth(updateTask)
  });

  router.service(ChatBotService, {
    chat: withAuth(chat)
  });
};
