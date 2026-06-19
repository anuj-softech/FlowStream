import {ConnectError, Code} from "@connectrpc/connect";
import {create} from "@bufbuild/protobuf";
import {prisma} from "../../prisma.js";
import {generateUuidV7} from "../../utils/uuid.js";
import type {AuthenticatedContext} from "../../middleware/auth.js";
import {checkProjectMembership, checkTaskAssigneeOrAdmin} from "./helpers.js";
import {
    UpdateTaskRequest,
    UpdateTaskResponse,
    UpdateTaskResponseSchema
} from "../../gen/project/v1/project_pb.js";

export async function updateTask(
    req: UpdateTaskRequest,
    ctx: AuthenticatedContext
): Promise<UpdateTaskResponse> {
    const {taskId, title, description, deadline, priority, parentId, assigneeIds, dependsOnTaskIds, status} = req;

    if (!taskId) {
        throw new ConnectError("Task ID is required", Code.InvalidArgument);
    }

    if (title !== undefined) {
        if (!title || !title.trim()) {
            throw new ConnectError("Task title is required", Code.InvalidArgument);
        }
        if (title.length > 100) {
            throw new ConnectError("Task title cannot exceed 100 characters", Code.InvalidArgument);
        }
    }

    if (description !== undefined && description && description.length > 10000) {
        throw new ConnectError("Task description cannot exceed 10000 characters", Code.InvalidArgument);
    }

    const existingTask = await prisma.task.findUnique({
        where: {id: taskId}
    });

    if (!existingTask) {
        throw new ConnectError("Task not found", Code.NotFound);
    }

    const isMember = await checkTaskAssigneeOrAdmin(existingTask.projectId, existingTask.id, ctx.user.id);
    if (!isMember) {
        throw new ConnectError("You are not a member of this project", Code.PermissionDenied);
    }

    if (parentId) {
        const parentTask = await prisma.task.findUnique({where: {id: parentId}});
        if (!parentTask || parentTask.projectId !== existingTask.projectId) {
            throw new ConnectError("Parent task not found in this project", Code.InvalidArgument);
        }
        if (req.deadline) {
            const newDeadline = new Date(req.deadline);
            if (newDeadline&& parentTask.deadline) {
                if (newDeadline.getTime() < parentTask.deadline.getTime()) {
                    throw new ConnectError(`Deadline must be greater than the dependencies deadline [${parentTask.deadline.toLocaleDateString()}]`, Code.InvalidArgument);
                }
            }
        }

    }

    await prisma.$transaction(async (tx) => {
        // 1. Build update data
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description || null;
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
        if (priority !== undefined) updateData.priority = priority;
        if (parentId !== undefined) updateData.parentId = parentId || null;
        if (status !== undefined) updateData.status = status;

        // Update the task row
        await tx.task.update({
            where: {id: taskId},
            data: updateData
        });

        // 2. Update assignees if provided
        if (assigneeIds !== undefined) {
            // Clear existing
            await tx.taskAssignee.deleteMany({where: {taskId}});

            // Create new
            for (const uid of assigneeIds) {
                const isAssigneeMember = await tx.projectMember.findUnique({
                    where: {projectId_userId: {projectId: existingTask.projectId, userId: uid}}
                });
                if (!isAssigneeMember) {
                    throw new ConnectError(`User ${uid} is not a member of this project`, Code.InvalidArgument);
                }

                await tx.taskAssignee.create({
                    data: {
                        id: generateUuidV7(),
                        taskId,
                        userId: uid
                    }
                });
            }
        }

        // 3. Update dependencies if provided
        if (dependsOnTaskIds !== undefined) {
            // Clear existing
            await tx.taskDependency.deleteMany({where: {taskId}});

            // Create new
            for (const depId of dependsOnTaskIds) {
                const depTask = await tx.task.findUnique({where: {id: depId}});
                if (!depTask || depTask.projectId !== existingTask.projectId) {
                    throw new ConnectError(`Dependency task ${depId} does not exist in this project`, Code.InvalidArgument);
                }

                await tx.taskDependency.create({
                    data: {
                        id: generateUuidV7(),
                        taskId,
                        dependsOnTaskId: depId
                    }
                });
            }
        }
    });

    // Fetch updated task
    const fullTask = await prisma.task.findUnique({
        where: {id: taskId},
        include: {
            assignees: {include: {user: true}},
            dependencies: true
        }
    });

    if (!fullTask) {
        throw new ConnectError("Failed to fetch updated task details", Code.Internal);
    }

    const mappedTask = {
        id: fullTask.id,
        projectId: fullTask.projectId,
        title: fullTask.title,
        description: fullTask.description || undefined,
        deadline: fullTask.deadline ? fullTask.deadline.toISOString() : undefined,
        status: fullTask.status,
        priority: fullTask.priority,
        parentId: fullTask.parentId || undefined,
        createdById: fullTask.createdById,
        createdAt: fullTask.createdAt.toISOString(),
        assignees: fullTask.assignees.map((a) => ({
            id: a.user.id,
            name: a.user.name,
            username: a.user.username,
            email: a.user.email,
            profilePicUrl: a.user.profilePicUrl || undefined,
            profession: a.user.profession || undefined,
            mobileNumber: a.user.mobileNumber || undefined,
            dateCreated: ""
        })),
        dependsOnTaskIds: fullTask.dependencies.map((d) => d.dependsOnTaskId)
    };

    return create(UpdateTaskResponseSchema, {
        task: mappedTask,
        message: "Task updated successfully"
    });
}
