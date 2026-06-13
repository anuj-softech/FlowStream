<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { goto } from "$app/navigation";

  onMount(async () => {
    const isAuthenticated = await auth.checkAuth();
    if (isAuthenticated) {
      goto("/dashboard", { replaceState: true });
    } else {
      goto("/register", { replaceState: true });
    }
  });
</script>

<div class="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
  <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/10 dark:bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
  <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-600/10 dark:bg-secondary-500/5 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="flex flex-col items-center gap-6 z-10 text-center animate-pulse">
    <img src="/logo.png" alt="FlowStream Logo" class="w-24 h-24 rounded-3xl shadow-2xl shadow-primary-600/10 select-none object-contain" />
    <div class="flex flex-col gap-1.5">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
        FlowStream
      </h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">
        Securing connection...
      </p>
    </div>
    <div class="w-12 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative">
      <div class="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
    </div>
  </div>
</div>

<style>
  @keyframes loading {
    0% { left: -50%; }
    50% { left: 100%; }
    100% { left: -50%; }
  }
</style>
