<script lang="ts">
  import Card from "../../../../components/Card.svelte";
  import Button from "../../../../components/Button.svelte";
  import { Carta, Markdown, MarkdownEditor } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";
  import { slash } from "@cartamd/plugin-slash";
  import { emoji } from "@cartamd/plugin-emoji";
  import { code } from "@cartamd/plugin-code";
  import { math } from "@cartamd/plugin-math";
  import { anchor } from "@cartamd/plugin-anchor";
  import { page } from "$app/state";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { projectClient } from "$lib/transport.js";
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

  let projectId = $derived(page.params.id || "");
  let projectDetails = $derived(projectId ? workspace.projectDetailsMap[projectId] || null : null);

  let activeProjectTab = $state("board");
  let taskFilter = $state("all");

  let searchQuery = $state("");
  let searchResults = $state<any[]>([]);
  let searchingUsers = $state(false);
  let inviteError = $state("");
  let inviteSuccess = $state("");

  let editName = $state("");
  let editDescription = $state("");
  let settingsError = $state("");
  let settingsSuccess = $state("");
  let savingSettings = $state(false);

  $effect(() => {
    if (projectDetails) {
      editName = projectDetails.project.name;
      editDescription = projectDetails.project.description || "";
      settingsError = "";
      settingsSuccess = "";
    }
  });

  async function handleSearchUsers(e?: Event) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    searchingUsers = true;
    inviteError = "";
    try {
      const res = await projectClient.searchUsers({ query: searchQuery.trim() });
      const memberUserIds = new Set(projectDetails?.members.map((m: any) => m.user?.id) || []);
      searchResults = (res.users || []).filter((u: any) => !memberUserIds.has(u.id));
    } catch (err: any) {
      inviteError = err.message || "Failed to search users";
    } finally {
      searchingUsers = false;
    }
  }

  async function handleSendInvite(inviteeId: string) {
    inviteError = "";
    inviteSuccess = "";
    try {
      await projectClient.sendInvite({ projectId, inviteeId });
      inviteSuccess = "Invitation sent successfully";
      searchResults = searchResults.filter(u => u.id !== inviteeId);
    } catch (err: any) {
      inviteError = err.message || "Failed to send invitation";
    }
  }

  async function handleSaveSettings(e: SubmitEvent) {
    e.preventDefault();
    if (!editName.trim()) {
      settingsError = "Project name is required";
      return;
    }
    if (editName.length > 100) {
      settingsError = "Project name cannot exceed 100 characters";
      return;
    }
    if (editDescription.length > 10000) {
      settingsError = "Project description cannot exceed 10000 characters";
      return;
    }
    savingSettings = true;
    settingsError = "";
    settingsSuccess = "";
    try {
      await projectClient.updateProject({ id: projectId, name: editName.trim(), description: editDescription.trim() });
      settingsSuccess = "Project details updated successfully";
      await workspace.loadAllData();
    } catch (err: any) {
      settingsError = err.message || "Failed to update project settings";
    } finally {
      savingSettings = false;
    }
  }

  let positions = $derived.by(() => {
    if (!projectDetails || !projectDetails.tasks) return {};
    const tasksList = projectDetails.tasks;
    const layers: { [taskId: string]: number } = {};
    const taskMap = new Map<string, any>(tasksList.map((t: any) => [t.id, t]));

    function getLayer(taskId: string, visited = new Set<string>()): number {
      if (layers[taskId] !== undefined) return layers[taskId];
      if (visited.has(taskId)) return 0;
      visited.add(taskId);

      const t = taskMap.get(taskId);
      if (!t || !t.dependsOnTaskIds || t.dependsOnTaskIds.length === 0) {
        layers[taskId] = 0;
        return 0;
      }

      let maxParentLayer = -1;
      for (const parentId of t.dependsOnTaskIds) {
        maxParentLayer = Math.max(maxParentLayer, getLayer(parentId, visited));
      }
      layers[taskId] = maxParentLayer + 1;
      return maxParentLayer + 1;
    }

    for (const t of tasksList) {
      getLayer(t.id);
    }

    const layerGroups: { [layer: number]: string[] } = {};
    for (const t of tasksList) {
      const l = layers[t.id] || 0;
      if (!layerGroups[l]) layerGroups[l] = [];
      layerGroups[l].push(t.id);
    }

    const calculated: { [taskId: string]: { x: number; y: number } } = {};
    const maxLayer = Math.max(-1, ...Object.keys(layerGroups).map(Number));
    const width = 800;
    const height = 450;
    const layerWidth = maxLayer > 0 ? (width - 200) / maxLayer : width - 200;

    for (let l = 0; l <= maxLayer; l++) {
      const taskIds = layerGroups[l] || [];
      const count = taskIds.length;
      const x = 100 + l * layerWidth;
      taskIds.forEach((id, idx) => {
        const y = count > 1
          ? 60 + (idx * (height - 120)) / (count - 1)
          : height / 2;
        calculated[id] = { x, y };
      });
    }

    return calculated;
  });
</script>

{#if !projectDetails}
  <div class="py-16 flex flex-col items-center justify-center gap-4">
    <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span class="text-xs text-slate-450">Loading workspace details...</span>
  </div>
{:else}
  <div class="flex flex-col gap-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
      <div class="flex flex-col gap-1 min-w-0">
        <div class="flex items-center gap-3">
          <h2 class="font-bold text-lg text-slate-900 dark:text-white p-1.5 pl-0 select-none truncate">
            {projectDetails.project.name}
          </h2>
          {#if projectDetails.project.adminId === auth.currentUser?.id}
            <span class="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary-500/10 shrink-0">Admin Console</span>
          {:else}
            <span class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">Team Member</span>
          {/if}
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 pl-0.5 mt-1 select-none">
          {#if projectDetails.project.description}
            {#key projectDetails.project.description}
              <Markdown {carta} value={projectDetails.project.description}/>
            {/key}
          {:else}
            <span class="italic text-slate-400">No description provided.</span>
          {/if}
        </div>
      </div>

      <div class="flex flex-wrap gap-3 shrink-0">
        <div class="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs bg-slate-55 dark:bg-slate-950">
          <button onclick={() => taskFilter = "all"}
                  class="px-3.5 py-2.5 font-bold transition-all cursor-pointer {taskFilter === 'all' ? 'bg-primary-600 text-white' : 'text-slate-450 hover:text-slate-600 dark:hover:text-white'}">
            All Tasks
          </button>
          <button onclick={() => taskFilter = "assigned"}
                  class="px-3.5 py-2.5 font-bold transition-all cursor-pointer {taskFilter === 'assigned' ? 'bg-primary-600 text-white' : 'text-slate-450 hover:text-slate-600 dark:hover:text-white'}">
            My Tasks
          </button>
        </div>

        <a href="/task/new?projectId={projectId}">
          <Button class="flex items-center gap-1.5 !py-2.5 !px-4 text-xs">
            <span class="material-symbols-rounded text-sm">add</span>
            <span>Add Task</span>
          </Button>
        </a>
      </div>
    </div>

    <div class="w-full md:hidden flex flex-col gap-1.5 self-start">
      <label for="projectTabSelect" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace View</label>
      <div class="relative w-full">
        <select
          id="projectTabSelect"
          bind:value={activeProjectTab}
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-primary-600 dark:text-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
        >
          <option value="board">Kanban Board</option>
          <option value="members">Team & Invites</option>
          <option value="dependencies">Task Graph</option>
          {#if projectDetails.project.adminId === auth.currentUser?.id}
            <option value="settings">Settings</option>
          {/if}
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
          <span class="material-symbols-rounded text-base">expand_more</span>
        </div>
      </div>
    </div>

    <div class="hidden md:flex gap-2 bg-slate-150 dark:bg-slate-950 p-1.5 rounded-2xl self-start">
      <button onclick={() => activeProjectTab = "board"}
              class="px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 {activeProjectTab === 'board' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-405 hover:text-slate-600 dark:hover:text-slate-200'}">
        <span class="material-symbols-rounded text-base">grid_view</span>
        <span>Kanban Board</span>
      </button>
      <button onclick={() => activeProjectTab = "members"}
              class="px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 {activeProjectTab === 'members' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-405 hover:text-slate-600 dark:hover:text-slate-200'}">
        <span class="material-symbols-rounded text-base">group</span>
        <span>Team & Invites</span>
      </button>
      <button onclick={() => activeProjectTab = "dependencies"}
              class="px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 {activeProjectTab === 'dependencies' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-455 hover:text-slate-600 dark:hover:text-slate-200'}">
        <span class="material-symbols-rounded text-base">account_tree</span>
        <span>Tasks Graph</span>
      </button>
      {#if projectDetails.project.adminId === auth.currentUser?.id}
        <button onclick={() => activeProjectTab = "settings"}
                class="px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 {activeProjectTab === 'settings' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-405 hover:text-slate-600 dark:hover:text-slate-200'}">
          <span class="material-symbols-rounded text-base">settings</span>
          <span>Settings</span>
        </button>
      {/if}
    </div>

    {#if activeProjectTab === "board"}
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-start overflow-x-auto pb-4">
        {#each ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"] as colStatus}
          {@const colTasks = projectDetails.tasks.filter((t: any) => t.status === colStatus && (taskFilter === 'all' || t.assignees.some((a: any) => a.id === auth.currentUser?.id)))}

          <div class="flex flex-col shadow-sm gap-4 min-w-[240px] bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/40">
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {colStatus.replace("_", " ")}
              </span>
              <span class="text-[10px] font-extrabold bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                {colTasks.length}
              </span>
            </div>

            <div class="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar pr-0.5">
              {#each colTasks as task}
                <a
                  href="/task/{task.id}"
                  class="group/card w-full items-center text-left bg-white dark:bg-slate-900 border border-slate-200 justify-between dark:border-slate-800 rounded-xl p-4 flex flex-row gap-2 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-pointer"
                >
                  <span class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{task.title}</span>
                  <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0
                    {task.priority === 'URGENT' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-500/20' :
                     task.priority === 'HIGH' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-500/20' :
                     task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-500/20' :
                     'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-500/20'}"
                  >
                    {task.priority}
                  </span>
                </a>
              {:else}
                <span class="text-[10px] text-slate-400 text-center py-6 italic select-none">Empty</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if activeProjectTab === "members"}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        <div class="lg:col-span-7">
          <Card class="overflow-hidden">
            <div class="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Project Team Members</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-100/30 dark:bg-slate-900/10 text-xs font-bold text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4">User</th>
                    <th class="px-6 py-4">Role</th>
                    <th class="px-6 py-4">Joined At</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {#each projectDetails.members as member}
                    <tr>
                      <td class="px-6 py-4 flex items-center gap-3">
                        {#if member.user?.profilePicUrl}
                          <img src={member.user.profilePicUrl} alt={member.user.name} class="w-8 h-8 rounded-lg object-cover"/>
                        {:else}
                          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center font-bold text-sm text-white">
                            {member.user?.name.charAt(0).toUpperCase()}
                          </div>
                        {/if}
                        <div class="flex flex-col">
                          <span class="text-slate-900 dark:text-slate-100 text-xs">{member.user?.name}</span>
                          <span class="text-[10px] text-slate-400">@{member.user?.username}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border
                          {member.role === 'ADMIN' ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 border-primary-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'}"
                        >
                          {member.role}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-xs text-slate-555">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div class="lg:col-span-5 flex flex-col gap-6">
          {#if projectDetails.project.adminId === auth.currentUser?.id}
            <Card class="p-6 flex flex-col gap-4">
              <h3 class="text-sm font-bold flex items-center gap-2">
                <span class="material-symbols-rounded text-primary-500">group_add</span>
                <span>Invite Team Members</span>
              </h3>

              <form onsubmit={handleSearchUsers} class="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  bind:value={searchQuery}
                  class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <Button type="submit" loading={searchingUsers} class="!py-2 !px-4 text-xs font-bold">
                  Search
                </Button>
              </form>

              {#if inviteSuccess}
                <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-1.5 select-none animate-fade-in">
                  <span class="material-symbols-rounded text-base select-none">check_circle</span>
                  <span>{inviteSuccess}</span>
                </div>
              {/if}

              {#if inviteError}
                <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-[10px] font-medium flex items-center gap-1.5 select-none animate-fade-in">
                  <span class="material-symbols-rounded text-base select-none">error</span>
                  <span>{inviteError}</span>
                </div>
              {/if}

              <div class="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {#each searchResults as user}
                  <div class="flex items-center justify-between p-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <div class="flex items-center gap-2.5">
                      {#if user.profilePicUrl}
                        <img src={user.profilePicUrl} alt={user.name} class="w-7 h-7 rounded-lg object-cover"/>
                      {:else}
                        <div class="w-7 h-7 rounded-lg bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      {/if}
                      <div class="flex flex-col">
                        <span class="text-xs font-bold">{user.name}</span>
                        <span class="text-[9px] text-slate-450">@{user.username}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      class="!py-1 !px-2.5 text-[10px] font-bold !rounded-lg"
                      onclick={() => handleSendInvite(user.id)}
                    >
                      Invite
                    </Button>
                  </div>
                {:else}
                  {#if searchQuery}
                    <span class="text-[11px] text-slate-400 text-center py-2 font-medium">No users matching search query</span>
                  {:else}
                    <span class="text-[11px] text-slate-400 text-center py-2 font-medium">Search for registered usernames to invite</span>
                  {/if}
                {/each}
              </div>
            </Card>
          {:else}
            <Card class="p-6 flex flex-col justify-center items-center text-center gap-4 bg-slate-50 dark:bg-slate-900/50">
              <span class="material-symbols-rounded text-3xl text-slate-400 select-none">info</span>
              <div class="flex flex-col gap-1 max-w-xs">
                <h4 class="text-xs font-bold font-heading">Invite Permissions</h4>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                  Only the project owner or administrator has permissions to send team invitations.
                </p>
              </div>
            </Card>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeProjectTab === "dependencies"}
      <Card class="p-6 flex flex-col gap-4 overflow-hidden animate-fade-in">
        <div class="flex flex-col gap-1">
          <h3 class="text-base font-bold flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">account_tree</span>
            <span>Task Dependency Diagram (DAG)</span>
          </h3>
          <p class="text-[11px] text-slate-400">
            Interactive graph depicting subtask hierarchy and blocking relationships. Arrow represents blockages (A -> B means A must finish before B).
          </p>
        </div>

        {#if projectDetails.tasks.length === 0}
          <div class="py-12 flex flex-col items-center gap-3 text-center">
            <span class="material-symbols-rounded text-3xl text-slate-350 dark:text-slate-750 select-none">timeline</span>
            <span class="text-xs text-slate-400">Add tasks to project to populate diagram</span>
          </div>
        {:else}
          <div class="w-full overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 p-2.5">
            <svg width="800" height="450" class="mx-auto block overflow-visible select-none">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="15"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" class="fill-primary-500 dark:fill-primary-400"/>
                </marker>
              </defs>

              {#each projectDetails.tasks as t}
                {#each t.dependsOnTaskIds || [] as depId}
                  {#if positions[t.id] && positions[depId]}
                    <path
                      d="M {positions[depId].x} {positions[depId].y} C {(positions[depId].x + positions[t.id].x) / 2} {positions[depId].y}, {(positions[depId].x + positions[t.id].x) / 2} {positions[t.id].y}, {positions[t.id].x} {positions[t.id].y}"
                      fill="none"
                      stroke="var(--color-primary-400)"
                      stroke-width="1.8"
                      marker-end="url(#arrow)"
                      class="opacity-45 hover:opacity-100 hover:stroke-primary-500 transition-all"
                    />
                  {/if}
                {/each}
              {/each}

              {#each projectDetails.tasks as t}
                {#if positions[t.id]}
                  <a href="/task/{t.id}" class="group cursor-pointer">
                    <rect
                      x={positions[t.id].x - 65}
                      y={positions[t.id].y - 22}
                      width="130"
                      height="44"
                      rx="10"
                      class="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 group-hover:stroke-primary-500 transition-colors shadow-xs"
                      stroke-width="1.5"
                    />
                    <rect
                      x={positions[t.id].x - 65}
                      y={positions[t.id].y - 22}
                      width="5"
                      height="44"
                      class="rx-l-10 {t.status === 'DONE' ? 'fill-emerald-500' : t.status === 'IN_PROGRESS' ? 'fill-blue-500' : t.status === 'BLOCKED' ? 'fill-rose-500' : 'fill-slate-400'}"
                    />
                    <text
                      x={positions[t.id].x - 50}
                      y={positions[t.id].y - 4}
                      class="text-[9px] font-extrabold fill-slate-700 dark:fill-slate-200 font-sans"
                    >
                      {t.title.length > 18 ? t.title.slice(0, 15) + '...' : t.title}
                    </text>
                    <text
                      x={positions[t.id].x - 50}
                      y={positions[t.id].y + 10}
                      class="text-[8px] font-medium fill-slate-400 font-sans"
                    >
                      Status: {t.status.replace("_", " ")}
                    </text>
                  </a>
                {/if}
              {/each}
            </svg>
          </div>
        {/if}
      </Card>
    {/if}

    {#if activeProjectTab === "settings" && projectDetails.project.adminId === auth.currentUser?.id}
      <Card class="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in max-w-2xl">
        <div class="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 class="text-base font-bold flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">settings</span>
            <span>Project Settings</span>
          </h3>
          <p class="text-[11px] text-slate-400">
            Edit the name and description of this collaborative workspace.
          </p>
        </div>

        {#if settingsError}
          <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 select-none animate-fade-in">
            <span class="material-symbols-rounded text-base">error</span>
            <span>{settingsError}</span>
          </div>
        {/if}

        {#if settingsSuccess}
          <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 select-none animate-fade-in">
            <span class="material-symbols-rounded text-base">check_circle</span>
            <span>{settingsSuccess}</span>
          </div>
        {/if}

        <form onsubmit={handleSaveSettings} class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label for="editProjectName" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Project Name</label>
            <input
              type="text"
              id="editProjectName"
              bind:value={editName}
              required
              maxlength="100"
              placeholder="E.g. Rythm Music Player"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="editProjectDesc" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
            <div class="w-full">
              <MarkdownEditor {carta} bind:value={editDescription} mode="tabs" placeholder="Describe this project using Markdown..."/>
            </div>
          </div>

          <Button type="submit" loading={savingSettings} class="self-start !px-6 !py-2.5 text-xs font-bold">
            Save Changes
          </Button>
        </form>
      </Card>
    {/if}
  </div>
{/if}
