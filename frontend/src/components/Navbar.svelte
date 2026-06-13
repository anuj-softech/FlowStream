<script lang="ts">
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { goto } from "$app/navigation";
  import ThemeToggle from "./ThemeToggle.svelte";

  async function handleLogout() {
    await auth.logout();
    goto("/login", { replaceState: true });
  }
</script>

<header class="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <img src="/logo.svg" alt="FlowStream Logo" class="w-10 h-10 rounded-xl select-none object-contain shadow-md shadow-primary-600/5" />
      <span class="text-xl font-bold font-heading bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
        FlowStream
      </span>
    </div>

    <div class="flex items-center gap-4">
      <ThemeToggle />

      {#if auth.currentUser}
        <div class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-xs font-semibold text-slate-900 dark:text-slate-100">{auth.currentUser.name}</span>
            <span class="text-[10px] font-medium text-slate-400">@{auth.currentUser.username}</span>
          </div>

          <div class="relative shrink-0">
            {#if auth.currentUser.profilePicUrl}
              <img
                src={auth.currentUser.profilePicUrl}
                alt={auth.currentUser.name}
                class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
              />
            {:else}
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center font-bold text-white shadow-inner">
                {auth.currentUser.name.charAt(0).toUpperCase()}
              </div>
            {/if}
          </div>

          <button
            onclick={handleLogout}
            type="button"
            class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all focus:outline-none"
            title="Sign Out"
          >
            <span class="material-symbols-rounded text-xl block select-none">logout</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
