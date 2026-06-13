<script lang="ts">
  import Card from "../../../components/Card.svelte";
  import Button from "../../../components/Button.svelte";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { goto } from "$app/navigation";

  let upcomingTasks = $derived.by(() => {
    return workspace.assignedTasks
      .filter(t => t.status !== "DONE" && t.status !== "REJECTED")
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, 5);
  });
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-1.5">
    <h1 class="text-3xl font-extrabold tracking-tight font-heading">
      Dashboard
    </h1>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Welcome back! Here is a summary of your workspace, tasks, and notifications.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <a 
      href="/projects"
      class="text-left group focus:outline-none block"
    >
      <Card class="p-5 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary-500 hover:scale-[1.01] cursor-pointer">
        <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
          <span class="material-symbols-rounded text-2xl select-none">folder</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Projects</span>
          <span class="text-xl font-bold group-hover:text-primary-500 transition-colors">{workspace.projects.length}</span>
        </div>
      </Card>
    </a>

    <a 
      href="/mytasks"
      class="text-left group focus:outline-none block"
    >
      <Card class="p-5 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary-500 hover:scale-[1.01] cursor-pointer">
        <div class="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-950/40 text-secondary-600 dark:text-secondary-400 flex items-center justify-center">
          <span class="material-symbols-rounded text-2xl select-none">assignment</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Assigned Tasks</span>
          <span class="text-xl font-bold group-hover:text-secondary-500 transition-colors">{workspace.assignedTasks.length}</span>
        </div>
      </Card>
    </a>

    <a 
      href="/notifications"
      class="text-left group focus:outline-none block"
    >
      <Card class="p-5 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary-500 hover:scale-[1.01] cursor-pointer">
        <div class="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <span class="material-symbols-rounded text-2xl select-none">notifications</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Invites</span>
          <span class="text-xl font-bold group-hover:text-rose-500 transition-colors">{workspace.invites.length}</span>
        </div>
      </Card>
    </a>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <div class="lg:col-span-5 flex flex-col gap-4">
      <Card class="p-6 flex flex-col gap-4 h-full">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-secondary-500">schedule</span>
          <span>Upcoming Tasks</span>
        </h3>

        {#if upcomingTasks.length === 0}
          <div class="py-12 flex flex-col items-center gap-4 text-center">
            <span class="material-symbols-rounded text-3xl text-slate-300 dark:text-slate-700">done_all</span>
            <div class="flex flex-col gap-1 max-w-xs">
              <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">All caught up!</h4>
              <p class="text-[11px] text-slate-400">
                You don't have any pending tasks with upcoming deadlines.
              </p>
            </div>
          </div>
        {:else}
          <div class="flex flex-col gap-3">
            {#each upcomingTasks as task}
              <a href="/task/{task.id}" class="flex items-center justify-between p-3.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:scale-[1.01] transition-all">
                <div class="flex flex-col gap-1">
                  <span class="text-xs font-bold leading-tight">{task.title}</span>
                  {#if task.deadline}
                    <span class="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                      <span class="material-symbols-rounded text-xs select-none">calendar_today</span>
                      <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    </span>
                  {:else}
                    <span class="text-[10px] text-slate-450 italic">No deadline</span>
                  {/if}
                </div>

                <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full border
                  {task.priority === 'URGENT' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-500/20' :
                   task.priority === 'HIGH' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-500/20' :
                   task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-500/20' :
                   'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-500/20'}"
                >
                  {task.priority}
                </span>
              </a>
            {/each}
          </div>
        {/if}
      </Card>
    </div>

    <div class="lg:col-span-7 flex flex-col gap-4">
      <Card class="p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">folder_open</span>
            <span>Recent Projects</span>
          </h3>
          <Button variant="outline" onclick={() => goto("/projects")} class="!py-1.5 !px-3 text-xs !rounded-lg font-bold">
            View All
          </Button>
        </div>

        {#if workspace.projects.length === 0}
          <div class="py-12 flex flex-col items-center gap-4 text-center">
            <span class="material-symbols-rounded text-4xl text-slate-300 dark:text-slate-700">create_new_folder</span>
            <div class="flex flex-col gap-1 max-w-xs">
              <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">No projects yet</h4>
              <p class="text-xs text-slate-405">
                Create a collaborative project to start building workspaces, task boards, and dependency graphs.
              </p>
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each workspace.projects.slice(0, 4) as proj}
              <a 
                href="/project/{proj.id}"
                class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary-500 hover:scale-[1.01]"
              >
                <div class="flex flex-col gap-1.5">
                  <span class="text-xs font-bold truncate">{proj.name}</span>
                  <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed min-h-[2rem]">
                    {proj.description || "No project description provided."}
                  </p>
                </div>
                <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[9px] text-slate-400">
                  <span>Created: {new Date(proj.createdAt).toLocaleDateString()}</span>
                  <span class="text-primary-500 font-bold flex items-center gap-0.5">
                    <span>Open</span>
                    <span class="material-symbols-rounded text-xs">arrow_forward</span>
                  </span>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </Card>
    </div>
  </div>
</div>
