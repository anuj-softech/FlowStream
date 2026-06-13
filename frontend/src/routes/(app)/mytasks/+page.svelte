<script lang="ts">
  import Card from "../../../components/Card.svelte";
  import { workspace } from "$lib/states/workspace.svelte.js";

  let statusFilter = $state("all");

  let filteredTasks = $derived.by(() => {
    if (statusFilter === "all") return workspace.assignedTasks;
    return workspace.assignedTasks.filter(t => t.status === statusFilter);
  });

  function getProjectName(projectId: string): string {
    const proj = workspace.projects.find(p => p.id === projectId);
    return proj ? proj.name : "Unknown Project";
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-extrabold tracking-tight font-heading">
        My Tasks
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Review and update all tasks assigned to you across all your projects.
      </p>
    </div>

    <div class="flex flex-wrap border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs bg-slate-55 dark:bg-slate-950">
      <button onclick={() => statusFilter = "all"} class="px-3 py-2 font-bold transition-all cursor-pointer {statusFilter === 'all' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-655 dark:hover:text-white'} font-sans">All</button>
      <button onclick={() => statusFilter = "TODO"} class="px-3 py-2 font-bold transition-all cursor-pointer {statusFilter === 'TODO' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-655 dark:hover:text-white'} font-sans">Todo</button>
      <button onclick={() => statusFilter = "IN_PROGRESS"} class="px-3 py-2 font-bold transition-all cursor-pointer {statusFilter === 'IN_PROGRESS' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-655 dark:hover:text-white'} font-sans">In Progress</button>
      <button onclick={() => statusFilter = "IN_REVIEW"} class="px-3 py-2 font-bold transition-all cursor-pointer {statusFilter === 'IN_REVIEW' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-655 dark:hover:text-white'} font-sans">In Review</button>
      <button onclick={() => statusFilter = "DONE"} class="px-3 py-2 font-bold transition-all cursor-pointer {statusFilter === 'DONE' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-655 dark:hover:text-white'} font-sans">Done</button>
    </div>
  </div>

  {#if filteredTasks.length === 0}
    <Card class="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
      <span class="material-symbols-rounded text-4xl text-slate-400 select-none">assignment_turned_in</span>
      <div class="flex flex-col gap-1 max-w-sm">
        <h4 class="text-md font-bold">No tasks found</h4>
        <p class="text-xs text-slate-450 leading-relaxed">
          No tasks match your current filter. If you have no assigned tasks, ask your project administrator to assign you to tasks.
        </p>
      </div>
    </Card>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredTasks as task}
        <a
          href="/task/{task.id}"
          class="group/card text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-pointer"
        >
          <div class="flex flex-col gap-1 min-w-0">
            <span class="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md self-start truncate max-w-[150px]" title={getProjectName(task.projectId)}>
              {getProjectName(task.projectId)}
            </span>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight truncate mt-1">{task.title}</span>
          </div>

          <span class="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shrink-0
            {task.status === 'DONE' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
             task.status === 'IN_PROGRESS' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' :
             task.status === 'BLOCKED' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' :
             'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}"
          >
            {task.status.replace("_", " ")}
          </span>
        </a>
      {/each}
    </div>
  {/if}
</div>
