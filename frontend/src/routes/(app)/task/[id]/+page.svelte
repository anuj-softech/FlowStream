<script lang="ts">
  import { onMount } from "svelte";
  import { Carta, Markdown, MarkdownEditor } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";
  import { slash } from "@cartamd/plugin-slash";
  import { emoji } from "@cartamd/plugin-emoji";
  import { code } from "@cartamd/plugin-code";
  import { math } from "@cartamd/plugin-math";
  import { anchor } from "@cartamd/plugin-anchor";
  import type { Task } from "$lib/gen/project/v1/project_pb.js";
  import { projectClient } from "$lib/transport.js";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { page } from "$app/state";
  import Button from "../../../../components/Button.svelte";
  import Card from "../../../../components/Card.svelte";
  import Input from "../../../../components/Input.svelte";
  import "../../../../components/carta.css";

  const carta = new Carta({
    sanitizer: DOMPurify.sanitize,
    extensions: [
      slash(),
      emoji(),
      code(),
      math(),
      anchor()
    ]
  });

  let taskId = $derived(page.params.id);

  let task = $state<Task | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");
  let success = $state("");

  let isEditingDesc = $state(false);
  let editTitle = $state("");
  let editDescription = $state("");
  let editPriority = $state("MEDIUM");
  let editStatus = $state("TODO");
  let editDeadline = $state("");
  let editParentId = $state("");
  let editAssigneeIds = $state<string[]>([]);
  let editDependsOnTaskIds = $state<string[]>([]);

  let showAssigneeSelect = $state(false);
  let showDependencySelect = $state(false);

  let projectDetails = $derived(task ? workspace.projectDetailsMap[task.projectId] || null : null);
  let members = $derived(projectDetails?.members || []);
  let tasks = $derived(projectDetails?.tasks || []);
  let candidateTasks = $derived(tasks.filter((t: any) => t.id !== taskId));

  async function loadDetails() {
    loading = true;
    error = "";
    try {
      const res = await projectClient.getTaskDetails({ taskId });
      if (res.task) {
        task = res.task;
        editTitle = res.task.title;
        editDescription = res.task.description || "";
        editPriority = res.task.priority;
        editStatus = res.task.status;
        editDeadline = res.task.deadline ? res.task.deadline.split("T")[0] : "";
        editParentId = res.task.parentId || "";
        editAssigneeIds = res.task.assignees.map(a => a.id);
        editDependsOnTaskIds = res.task.dependsOnTaskIds || [];
      } else {
        error = "Task not found";
      }
    } catch (err: any) {
      error = err.message || "Failed to load task details";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadDetails();
  });

  async function handleSaveChanges() {
    if (!editTitle.trim()) {
      error = "Task title is required";
      return;
    }
    if (editTitle.length > 100) {
      error = "Task title cannot exceed 100 characters";
      return;
    }
    if (editDescription.length > 10000) {
      error = "Task description cannot exceed 10000 characters";
      return;
    }
    saving = true;
    error = "";
    success = "";
    try {
      await projectClient.updateTask({
        taskId,
        title: editTitle,
        description: editDescription,
        deadline: editDeadline || "",
        priority: editPriority,
        parentId: editParentId || "",
        assigneeIds: editAssigneeIds,
        dependsOnTaskIds: editDependsOnTaskIds,
        status: editStatus
      });
      success = "Task updated successfully";
      isEditingDesc = false;
      await workspace.loadAllData();
      await loadDetails();
    } catch (err: any) {
      error = err.message || "Failed to save changes";
    } finally {
      saving = false;
    }
  }

  function toggleAssignee(userId: string) {
    if (editAssigneeIds.includes(userId)) {
      editAssigneeIds = editAssigneeIds.filter(id => id !== userId);
    } else {
      editAssigneeIds = [...editAssigneeIds, userId];
    }
  }

  function toggleDependency(depTaskId: string) {
    if (editDependsOnTaskIds.includes(depTaskId)) {
      editDependsOnTaskIds = editDependsOnTaskIds.filter(id => id !== depTaskId);
    } else {
      editDependsOnTaskIds = [...editDependsOnTaskIds, depTaskId];
    }
  }

  let backLink = $derived(task ? `/project/${task.projectId}` : "/projects");
</script>

<div class="flex flex-col gap-6 text-slate-900 dark:text-slate-100">
  <div class="flex flex-col gap-3">
    <a href={backLink} class="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-fit">
      <span class="material-symbols-rounded text-base">arrow_back</span>
      <span>Back to Project</span>
    </a>
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-extrabold font-heading text-slate-800 dark:text-white tracking-tight">Task Details</h1>
      <div class="flex items-center gap-2">
        <a href={backLink}>
          <Button variant="outline" class="!py-2 !px-4 text-xs">Close</Button>
        </a>
        <Button onclick={handleSaveChanges} loading={saving} class="!py-2 !px-4 text-xs font-bold">Save Changes</Button>
      </div>
    </div>
  </div>

  <div class="w-full flex flex-col">
    {#if error}
      <div class="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 select-none">
        <span class="material-symbols-rounded text-base select-none">error</span>
        <span>{error}</span>
      </div>
    {/if}

    {#if success}
      <div class="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 select-none">
        <span class="material-symbols-rounded text-base select-none">check_circle</span>
        <span>{success}</span>
      </div>
    {/if}

    {#if loading}
      <div class="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs text-slate-450">Loading task details...</span>
      </div>
    {:else if task}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div class="lg:col-span-8 flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <input
              type="text"
              bind:value={editTitle}
              maxlength="100"
              class="w-full bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-primary-500 focus:outline-none text-2xl font-extrabold py-1"
              placeholder="Task Title"
            />
            <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span class="bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-bold px-2 py-0.5 rounded-md">
                Task ID: #{task.id.slice(0, 8)}
              </span>
              <span>Created at {new Date(task.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <Card class="p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</span>
              {#if !isEditingDesc}
                <button
                  onclick={() => isEditingDesc = true}
                  class="text-xs font-bold text-primary-600 hover:text-primary-500 flex items-center gap-1 cursor-pointer"
                >
                  <span class="material-symbols-rounded text-sm">edit</span>
                  <span>Edit</span>
                </button>
              {:else}
                <button
                  onclick={() => isEditingDesc = false}
                  class="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              {/if}
            </div>

            <div class="min-h-[150px]">
              {#if isEditingDesc}
                <MarkdownEditor {carta} bind:value={editDescription} mode="tabs" placeholder="Describe the requirements or work needed..." />
              {:else}
                {#key editDescription}
                  {#if editDescription}
                    <div class="prose prose-slate dark:prose-invert max-w-none">
                      <Markdown {carta} value={editDescription} />
                    </div>
                  {:else}
                    <p class="text-xs italic text-slate-400">No description provided. Click edit to write a description.</p>
                  {/if}
                {/key}
              {/if}
            </div>
          </Card>
        </div>

        <div class="lg:col-span-4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
          <div class="flex flex-col gap-1.5">
            <label for="taskStatus" class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
            <select
              id="taskStatus"
              bind:value={editStatus}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="taskPriority" class="text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</label>
            <select
              id="taskPriority"
              bind:value={editPriority}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="taskDeadline" class="text-xs font-semibold uppercase tracking-wider text-slate-500">Deadline</label>
            <input
              id="taskDeadline"
              type="date"
              bind:value={editDeadline}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="taskParent" class="text-xs font-semibold uppercase tracking-wider text-slate-500">Parent Task</label>
            <select
              id="taskParent"
              bind:value={editParentId}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">None</option>
              {#each candidateTasks as t}
                <option value={t.id}>{t.title}</option>
              {/each}
            </select>
          </div>

          <div class="flex flex-col gap-2 relative">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Assignees</span>
              <button
                onclick={() => showAssigneeSelect = !showAssigneeSelect}
                class="text-[10px] font-bold text-primary-600 hover:text-primary-500 flex items-center gap-0.5 cursor-pointer"
              >
                <span class="material-symbols-rounded text-sm">settings</span>
                <span>Manage</span>
              </button>
            </div>

            <div class="flex flex-col gap-2">
              {#if editAssigneeIds.length === 0}
                <span class="text-xs italic text-slate-400 font-medium">No one assigned</span>
              {:else}
                <div class="flex flex-wrap gap-1.5">
                  {#each editAssigneeIds as id}
                    {@const member = members.find((m: any) => m.user?.id === id)}
                    {#if member && member.user}
                      <span class="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium">
                        <span class="w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                        <span>{member.user.name}</span>
                      </span>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>

            {#if showAssigneeSelect}
              <Card class="absolute top-6 right-0 w-64 p-3.5 z-20 flex flex-col gap-2 shadow-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Select Assignees</span>
                {#each members as m}
                  {#if m.user}
                    <button
                      onclick={() => toggleAssignee(m.user.id)}
                      class="flex items-center justify-between text-left py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer"
                    >
                      <span>{m.user.name}</span>
                      {#if editAssigneeIds.includes(m.user.id)}
                        <span class="material-symbols-rounded text-sm text-primary-600">check</span>
                      {/if}
                    </button>
                  {/if}
                {/each}
              </Card>
            {/if}
          </div>

          <div class="flex flex-col gap-2 relative border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Dependencies</span>
              <button
                onclick={() => showDependencySelect = !showDependencySelect}
                class="text-[10px] font-bold text-primary-600 hover:text-primary-500 flex items-center gap-0.5 cursor-pointer"
              >
                <span class="material-symbols-rounded text-sm">settings</span>
                <span>Manage</span>
              </button>
            </div>

            <div class="flex flex-col gap-2">
              {#if editDependsOnTaskIds.length === 0}
                <span class="text-xs italic text-slate-400 font-medium">No dependencies</span>
              {:else}
                <div class="flex flex-col gap-1.5">
                  {#each editDependsOnTaskIds as id}
                    {@const dep = tasks.find((t: any) => t.id === id)}
                    {#if dep}
                      <span class="inline-flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold">
                        <span class="truncate pr-1">{dep.title}</span>
                        <span class="text-[9px] font-extrabold uppercase shrink-0
                          {dep.status === 'DONE' ? 'text-emerald-500' : 'text-slate-400'}"
                        >
                          ({dep.status.replace("_", " ")})
                        </span>
                      </span>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>

            {#if showDependencySelect}
              <Card class="absolute top-6 right-0 w-64 p-3.5 z-20 flex flex-col gap-2 shadow-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Depends On</span>
                {#each candidateTasks as t}
                  <button
                    onclick={() => toggleDependency(t.id)}
                    class="flex items-center justify-between text-left py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer"
                  >
                    <span class="truncate pr-2">{t.title}</span>
                    {#if editDependsOnTaskIds.includes(t.id)}
                      <span class="material-symbols-rounded text-sm text-primary-600">check</span>
                    {/if}
                  </button>
                {/each}
              </Card>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
