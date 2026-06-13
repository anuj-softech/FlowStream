<script lang="ts">
  import Card from "../../../components/Card.svelte";
  import Button from "../../../components/Button.svelte";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { projectClient } from "$lib/transport.js";

  let loadingInviteId = $state("");
  let error = $state("");

  async function handleRespond(inviteId: string, action: "ACCEPT" | "DECLINE") {
    loadingInviteId = inviteId;
    error = "";
    try {
      await projectClient.respondToInvite({ inviteId, action });
      await workspace.loadAllData();
    } catch (err: any) {
      error = err.message || "Failed to respond to invitation";
    } finally {
      loadingInviteId = "";
    }
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-1">
    <h1 class="text-3xl font-extrabold tracking-tight font-heading">
      Notifications
    </h1>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Accept or decline invitations to collaborate on other workspaces.
    </p>
  </div>

  {#if error}
    <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2 select-none animate-fade-in">
      <span class="material-symbols-rounded text-lg">error</span>
      <span>{error}</span>
    </div>
  {/if}

  <Card class="p-6 flex flex-col gap-4">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
      <h3 class="text-base font-bold flex items-center gap-2">
        <span class="material-symbols-rounded text-primary-500">mail</span>
        <span>Collaborative Project Invitations</span>
      </h3>
      <span class="bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
        {workspace.invites.length} Pending
      </span>
    </div>

    <div class="flex flex-col gap-3">
      {#each workspace.invites as inv}
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-bold">{inv.projectName}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              Invited by <span class="font-semibold text-slate-700 dark:text-slate-300">{inv.inviterName}</span> &bull; {new Date(inv.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div class="flex gap-2">
            <Button
              variant="primary"
              class="!py-1.5 !px-4 text-xs !rounded-lg font-bold"
              disabled={loadingInviteId === inv.id}
              onclick={() => handleRespond(inv.id, "ACCEPT")}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              class="!py-1.5 !px-4 text-xs !rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold"
              disabled={loadingInviteId === inv.id}
              onclick={() => handleRespond(inv.id, "DECLINE")}
            >
              Decline
            </Button>
          </div>
        </div>
      {:else}
        <div class="py-12 flex flex-col items-center gap-4 text-center">
          <span class="material-symbols-rounded text-4xl text-slate-300 dark:text-slate-700 select-none">mail_outline</span>
          <div class="flex flex-col gap-1 max-w-xs">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">All caught up</h4>
            <p class="text-xs text-slate-400">
              You have no pending invitations to join projects.
            </p>
          </div>
        </div>
      {/each}
    </div>
  </Card>
</div>
