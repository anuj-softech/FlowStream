<script lang="ts">
  import ThemeToggle from "../ThemeToggle.svelte";
  import { auth } from "$lib/hooks/auth.svelte.js";

  interface Props {
    title: string;
    onToggleDrawer?: () => void;
  }

  let { title, onToggleDrawer }: Props = $props();
</script>

<header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
  <div class="flex items-center gap-4">
    {#if onToggleDrawer}
      <button 
        onclick={onToggleDrawer}
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none cursor-pointer"
      >
        <span class="material-symbols-rounded text-2xl block">menu</span>
      </button>
    {/if}
    
    <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-400 select-none">
      {#if title.includes(" / ")}
        {@const parts = title.split(" / ")}
        <span class="text-slate-500 dark:text-slate-400 font-medium">{parts[0]}</span>
        <span class="material-symbols-rounded text-base text-slate-300 dark:text-slate-700">chevron_right</span>
        <span class="text-slate-600 dark:text-slate-300 font-bold">{parts[1]}</span>
      {:else}
        <span class="text-slate-600 dark:text-slate-300 font-bold">{title}</span>
      {/if}
    </div>
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
      </div>
    {/if}
  </div>
</header>
