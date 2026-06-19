<script lang="ts">
  import Input from "../../../../components/Input.svelte";
  import Button from "../../../../components/Button.svelte";
  import Card from "../../../../components/Card.svelte";
  import { Carta, MarkdownEditor } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";
  import { slash } from "@cartamd/plugin-slash";
  import { emoji } from "@cartamd/plugin-emoji";
  import { code } from "@cartamd/plugin-code";
  import { math } from "@cartamd/plugin-math";
  import { anchor } from "@cartamd/plugin-anchor";
  import { page } from "$app/state";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { projectClient } from "$lib/transport.js";
  import { goto } from "$app/navigation";
  import "../../../../components/carta.css";

  let queryProjectId = $derived(page.url.searchParams.get("projectId") || "");
  let selectedProjectId = $state("");

  $effect(() => {
    if (queryProjectId) {
      selectedProjectId = queryProjectId;
    } else if (workspace.projects.length > 0 && !selectedProjectId) {
      selectedProjectId = workspace.projects[0].id;
    }
  });

  let projectDetails = $derived(workspace.projectDetailsMap[selectedProjectId] || null);
  let members = $derived(projectDetails?.members || []);
  let tasks = $derived(projectDetails?.tasks || []);

  let title = $state("");
  let description = $state("");
  let deadline = $state("");
  let priority = $state("MEDIUM");
  let parentId = $state("");
  let assigneeIds = $state<string[]>([]);
  let dependsOnTaskIds = $state<string[]>([]);

  let loading = $state(false);
  let error = $state("");

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

  async function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedProjectId) {
      error = "Please select a project";
      return;
    }
    if (!title.trim()) {
      error = "Task title is required";
      return;
    }
    if (title.length > 100) {
      error = "Task title cannot exceed 100 characters";
      return;
    }
    if (description.length > 10000) {
      error = "Task description cannot exceed 10000 characters";
      return;
    }
    loading = true;
    error = "";
    try {
      await projectClient.createTask({
        projectId: selectedProjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        priority,
        parentId: parentId || undefined,
        assigneeIds,
        dependsOnTaskIds
      });
      await workspace.loadAllData();
      goto(`/project/${selectedProjectId}`);
    } catch (err: any) {
      error = err.message || "Failed to create task";
    } finally {
      loading = false;
    }
  }

  let backLink = $derived(selectedProjectId ? `/project/${selectedProjectId}` : "/projects");
</script>

<div class="flex flex-col gap-6">
  <div class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between rounded-2xl shadow-sm">
    <div class="flex items-center gap-3">
      <a href={backLink} class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
        <span class="material-symbols-rounded text-lg">arrow_back</span>
        <span>Back</span>
      </a>
      <div class="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
      <h3 class="text-sm font-extrabold font-heading dark:text-white uppercase tracking-wider">Add Project Task</h3>
    </div>
    <div class="flex gap-3">
      <a href={backLink}>
        <Button variant="outline" type="button" class="!py-2 !px-4 text-xs">Cancel</Button>
      </a>
      <Button type="submit" form="taskForm" {loading} class="!py-2 !px-4 text-xs">Create Task</Button>
    </div>
  </div>

  {#if error}
    <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 select-none animate-fade-in">
      <span class="material-symbols-rounded text-base select-none">error</span>
      <span>{error}</span>
    </div>
  {/if}

  <form id="taskForm" onsubmit={handleFormSubmit} class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
    <div class="md:col-span-8 flex flex-col gap-6">
      <Card class="p-6 flex flex-col gap-5">
        {#if !queryProjectId}
          <div class="flex flex-col gap-1.5">
            <label for="taskProject" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Project</label>
            <select
              id="taskProject"
              bind:value={selectedProjectId}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {#each workspace.projects as proj}
                <option value={proj.id}>{proj.name}</option>
              {/each}
            </select>
          </div>
        {/if}

        <Input id="taskTitle" label="Task Title" required placeholder="E.g. Register RPC routes" bind:value={title} maxlength={100} />
        
        <div class="flex flex-col gap-1.5">
          <label for="taskDesc" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
          <div class="w-full">
            <MarkdownEditor {carta} bind:value={description} mode="tabs" placeholder="Add detailed task instructions using Markdown..." />
          </div>
        </div>
      </Card>
    </div>

    <div class="md:col-span-4 flex flex-col gap-6">
      <Card class="p-6 flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <label for="taskPriority" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority</label>
          <select 
            id="taskPriority" 
            bind:value={priority} 
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="taskDeadline" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Deadline</label>
          <input 
            type="date" 
            id="taskDeadline" 
            bind:value={deadline} 
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" 
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="taskParent" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parent Task (Convert to Subtask)</label>
          <select 
            id="taskParent" 
            bind:value={parentId} 
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">-- No Parent (Root Task) --</option>
            {#each tasks as t}
              {#if !t.parentId}
                <option value={t.id}>{t.title}</option>
              {/if}
            {/each}
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assign Members</span>
          <div class="flex flex-col gap-2 max-h-[160px] overflow-y-auto border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl bg-slate-55 dark:bg-slate-900/40 custom-scrollbar">
            {#each members as member}
              {#if member.user}
                <label class="flex items-center gap-2 px-2 py-1 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <input 
                    type="checkbox" 
                    value={member.user.id} 
                    bind:group={assigneeIds} 
                    class="rounded border-slate-300 dark:border-slate-700 text-primary-500 focus:ring-primary-500 h-3.5 w-3.5" 
                  />
                  <span>{member.user.name}</span>
                </label>
              {/if}
            {:else}
              <span class="text-xs italic text-slate-400">No members to assign</span>
            {/each}
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Blocking Tasks (Dependencies)</span>
          <div class="flex flex-col gap-2 max-h-[160px] overflow-y-auto border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl bg-slate-55 dark:bg-slate-900/40 custom-scrollbar">
            {#each tasks as t}
              <label class="flex items-center gap-2 px-2 py-1 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  value={t.id} 
                  bind:group={dependsOnTaskIds} 
                  class="rounded border-slate-300 dark:border-slate-700 text-primary-500 focus:ring-primary-500 h-3.5 w-3.5" 
                />
                <span>{t.title}</span>
              </label>
            {:else}
              <span class="text-xs italic text-slate-400">No tasks to block on</span>
            {/each}
          </div>
        </div>
      </Card>
    </div>
  </form>
</div>
