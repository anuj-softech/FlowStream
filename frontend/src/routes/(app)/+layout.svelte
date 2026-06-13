<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import Header from "../../components/home/Header.svelte";
  import ThemeToggle from "../../components/ThemeToggle.svelte";

  let { children } = $props();
  let isDrawerOpen = $state(false);

  onMount(async () => {
    if (!auth.currentUser) {
      const authenticated = await auth.checkAuth();
      if (!authenticated) {
        goto("/login", { replaceState: true });
        return;
      }
    }
    await workspace.loadAllData();
  });

  async function handleLogout() {
    await auth.logout();
    goto("/login", { replaceState: true });
  }

  let headerTitle = $derived.by(() => {
    const path = page.url.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/projects") return "Projects";
    if (path === "/project/new") return "Projects / Create Project";
    if (path.startsWith("/project/")) {
      const projId = page.params.id;
      const proj = projId ? workspace.projectDetailsMap[projId]?.project : undefined;
      return `Projects / ${proj ? proj.name : "Workspace"}`;
    }
    if (path === "/mytasks") return "My Tasks";
    if (path === "/notifications") return "Notifications";
    if (path === "/settings") return "Settings";
    if (path === "/task/new") return "Tasks / Create Task";
    if (path.startsWith("/task/")) return "Tasks / Task Details";
    return "FlowStream";
  });
</script>

{#if auth.currentUser}
  <div class="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
    
    {#if isDrawerOpen}
      <button 
        type="button"
        onclick={() => isDrawerOpen = false}
        class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
        aria-label="Close sidebar"
      ></button>
    {/if}

    <div class="hidden lg:block h-full">
      <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 h-full">
        <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
          <img src="/logo.svg" alt="FlowStream Logo" class="w-8 h-8 rounded-lg select-none object-contain" />
          <div class="flex flex-col">
            <span class="text-sm font-bold text-white tracking-tight">FlowStream</span>
            <span class="text-[10px] text-primary-400 font-semibold uppercase tracking-wider">Console</span>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1 font-sans">Overview</span>
            <a 
              href="/dashboard"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                {page.url.pathname === '/dashboard' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
            >
              <span class="material-symbols-rounded text-lg">dashboard</span>
              <span>Dashboard</span>
            </a>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1 font-sans">Workspace</span>
            <a 
              href="/projects"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                {page.url.pathname === '/projects' || page.url.pathname.startsWith('/project/') ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
            >
              <span class="material-symbols-rounded text-lg">folder_open</span>
              <span>Projects</span>
            </a>
            <a 
              href="/mytasks"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                {page.url.pathname === '/mytasks' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
            >
              <span class="material-symbols-rounded text-lg">assignment</span>
              <span>My Tasks</span>
            </a>
            <a 
              href="/notifications"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left relative
                {page.url.pathname === '/notifications' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
            >
              <span class="material-symbols-rounded text-lg">notifications</span>
              <span>Notifications</span>
              {#if workspace.invites.length > 0}
                <span class="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {workspace.invites.length}
                </span>
              {/if}
            </a>
          </div>

          <div class="flex flex-col gap-1 mt-auto font-sans">
            <a 
              href="/settings"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left mb-1
                {page.url.pathname === '/settings' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
            >
              <span class="material-symbols-rounded text-lg">settings</span>
              <span>Settings</span>
            </a>
            <button 
              onclick={handleLogout}
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left text-slate-400 hover:text-rose-550 hover:bg-rose-950/20 cursor-pointer"
            >
              <span class="material-symbols-rounded text-lg">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </div>

    {#if isDrawerOpen}
      <div class="fixed inset-y-0 left-0 w-64 z-50 lg:hidden animate-slide-in-left">
        <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 h-full">
          <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
            <img src="/logo.svg" alt="FlowStream Logo" class="w-8 h-8 rounded-lg select-none object-contain" />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-white tracking-tight">FlowStream</span>
              <span class="text-[10px] text-primary-400 font-semibold uppercase tracking-wider">Console</span>
            </div>
          </div>

          <nav class="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1 font-sans">Overview</span>
              <a 
                href="/dashboard"
                onclick={() => isDrawerOpen = false}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                  {page.url.pathname === '/dashboard' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
              >
                <span class="material-symbols-rounded text-lg">dashboard</span>
                <span>Dashboard</span>
              </a>
            </div>

            <div class="flex flex-col gap-1 font-sans">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1">Workspace</span>
              <a 
                href="/projects"
                onclick={() => isDrawerOpen = false}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                  {page.url.pathname === '/projects' || page.url.pathname.startsWith('/project/') ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
              >
                <span class="material-symbols-rounded text-lg">folder_open</span>
                <span>Projects</span>
              </a>
              <a 
                href="/mytasks"
                onclick={() => isDrawerOpen = false}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                  {page.url.pathname === '/mytasks' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
              >
                <span class="material-symbols-rounded text-lg">assignment</span>
                <span>My Tasks</span>
              </a>
              <a 
                href="/notifications"
                onclick={() => isDrawerOpen = false}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left relative
                  {page.url.pathname === '/notifications' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
              >
                <span class="material-symbols-rounded text-lg">notifications</span>
                <span>Notifications</span>
                {#if workspace.invites.length > 0}
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {workspace.invites.length}
                  </span>
                {/if}
              </a>
            </div>

            <div class="flex flex-col gap-1 mt-auto font-sans">
              <a 
                href="/settings"
                onclick={() => isDrawerOpen = false}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left mb-1
                  {page.url.pathname === '/settings' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
              >
                <span class="material-symbols-rounded text-lg">settings</span>
                <span>Settings</span>
              </a>
              <button 
                onclick={() => { handleLogout(); isDrawerOpen = false; }}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left text-slate-400 hover:text-rose-550 hover:bg-rose-950/20 cursor-pointer"
              >
                <span class="material-symbols-rounded text-lg">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>
      </div>
    {/if}

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header 
        title={headerTitle} 
        onToggleDrawer={() => isDrawerOpen = true} 
      />
      <main class="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
        {@render children()}
      </main>
    </div>
  </div>
{/if}
