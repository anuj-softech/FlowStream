<script lang="ts">
  import Card from "../../../components/Card.svelte";
  import Button from "../../../components/Button.svelte";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { projectClient } from "$lib/transport.js";

  let showJoinModal = $state(false);
  let respondingInviteId = $state("");

  async function handleJoinAction(inviteId: string, action: "ACCEPT" | "DECLINE") {
    respondingInviteId = inviteId;
    try {
      await projectClient.respondToInvite({ inviteId, action });
      await workspace.loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      respondingInviteId = "";
    }
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-1">
    <h1 class="text-3xl font-extrabold tracking-tight font-heading">
      Projects
    </h1>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Create, join, and collaborate on your workspaces.
    </p>
  </div>

  {#if workspace.loadingProjects}
    <div class="py-16 flex items-center justify-center">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <a
        href="/project/new"
        class="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl flex flex-col justify-center items-center gap-4 cursor-pointer transition-all duration-300 group min-h-[170px]"
      >
        <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span class="material-symbols-rounded text-2xl select-none">add</span>
        </div>
        <div class="flex flex-col items-center gap-1 text-center font-sans">
          <span class="text-sm font-bold group-hover:text-primary-500 transition-colors">Create Project</span>
          <span class="text-xs text-slate-400">Initialize a new team workspace</span>
        </div>
      </a>

      <button
        type="button"
        onclick={() => showJoinModal = true}
        class="p-6 bg-slate-55 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-secondary-500 dark:hover:border-secondary-500 rounded-2xl flex flex-col justify-center items-center gap-4 cursor-pointer transition-all duration-300 group min-h-[170px] text-left"
      >
        <div class="w-12 h-12 mx-auto rounded-full bg-secondary-100 dark:bg-secondary-950/40 text-secondary-600 dark:text-secondary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span class="material-symbols-rounded text-2xl select-none">group_add</span>
        </div>
        <div class="flex flex-col items-center gap-1 text-center font-sans">
          <span class="text-sm font-bold group-hover:text-secondary-500 transition-colors">Join Projects</span>
          {#if workspace.invites.length > 0}
            <span class="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full mt-1">
              {workspace.invites.length} Pending Invites
            </span>
          {:else}
            <span class="text-xs text-slate-400">Review pending team invitations</span>
          {/if}
        </div>
      </button>

      {#each workspace.projects as proj}
        <a
          href="/project/{proj.id}"
          class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:border-primary-500 hover:scale-[1.01] min-h-[170px]"
        >
          <div class="flex flex-col gap-1.5 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold truncate">{proj.name}</span>
              {#if proj.adminId === auth.currentUser?.id}
                <span class="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-500/10 shrink-0">Admin</span>
              {:else}
                <span class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">Member</span>
              {/if}
            </div>
            <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {proj.description || "No description provided."}
            </p>
          </div>
          
          <div class="flex items-center justify-between border-t-2 border-slate-200 dark:border-slate-800 pt-3">
            <span class="text-[10px] text-slate-400">Created: {new Date(proj.createdAt).toLocaleDateString()}</span>
            <span class="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
              <span>Workspace</span>
              <span class="material-symbols-rounded text-sm">arrow_forward</span>
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

{#if showJoinModal}
  <div 
    role="button"
    tabindex="0"
    onclick={(e) => { if (e.target === e.currentTarget) showJoinModal = false; }}
    onkeydown={(e) => { if (e.key === "Escape") showJoinModal = false; }}
    class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-md flex flex-col gap-6 max-h-[500px]">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold font-heading">Pending Invitations</h3>
        <button onclick={() => showJoinModal = false} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <div class="overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
        {#each workspace.invites as inv}
          <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
            <div class="flex flex-col gap-1 min-w-0">
              <span class="text-xs font-bold truncate">{inv.projectName}</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Invited by {inv.inviterName}
              </span>
            </div>
            <div class="flex gap-1.5 shrink-0">
              <Button
                variant="primary"
                class="!py-1 !px-2.5 text-[10px] !rounded-lg"
                disabled={respondingInviteId === inv.id}
                onclick={() => handleJoinAction(inv.id, "ACCEPT")}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                class="!py-1 !px-2.5 text-[10px] !rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                disabled={respondingInviteId === inv.id}
                onclick={() => handleJoinAction(inv.id, "DECLINE")}
              >
                Decline
              </Button>
            </div>
          </div>
        {:else}
          <div class="py-8 flex flex-col items-center gap-3 text-center">
            <span class="material-symbols-rounded text-3xl text-slate-300 dark:text-slate-700 select-none">mail_outline</span>
            <span class="text-xs text-slate-400">No pending invitations found</span>
          </div>
        {/each}
      </div>

      <Button variant="outline" onclick={() => showJoinModal = false} class="w-full mt-2">Close</Button>
    </div>
  </div>
{/if}
