<script lang="ts">
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { goto } from "$app/navigation";
  import Card from "../components/Card.svelte";
  import Input from "../components/Input.svelte";
  import Button from "../components/Button.svelte";

  let email = $state("");
  let password = $state("");
  let formError = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    formError = "";

    const success = await auth.login(email, password);
    if (success) {
      await goto("/dashboard", { replaceState: true });
    } else {
      formError = auth.error || "Invalid email or password";
    }
  }

  function handleNavigate(url: string, e: MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      window.open(url, "_blank");
      return;
    }
    e.preventDefault();
    goto(url, { replaceState: true });
  }
</script>

<div class="h-screen w-full bg-slate-50 dark:bg-slate-950 flex justify-center items-center p-4 md:p-8 relative overflow-hidden">
  <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/10 dark:bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
  <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-600/10 dark:bg-secondary-500/5 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="w-full max-w-md z-10 flex flex-col gap-6">
    <div class="text-center">
      <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">Already registered? Login here</span>
    </div>

    <Card class="p-6 sm:p-8 flex flex-col shadow-lg">
      <div class="flex items-center gap-2.5 mb-6 justify-center">
        <img src="/logo.svg" alt="FlowStream Logo" class="w-8 h-8 rounded-lg select-none object-contain" />
        <span class="text-md font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          FlowStream
        </span>
      </div>

      <div class="flex flex-col gap-1 text-center mb-6">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
        <p class="text-xs text-slate-400">Enter your credentials to access your dashboard</p>
      </div>

      {#if formError}
        <div class="p-3.5 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
          <span class="material-symbols-rounded text-lg select-none">error</span>
          <span>{formError}</span>
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="flex flex-col gap-4">
        <Input id="email" label="Email Address" type="email" required placeholder="name@domain.com" bind:value={email} maxlength={100} autocomplete="username" />
        
        <Input id="password" label="Password" type="password" required placeholder="••••••••" bind:value={password} maxlength={100} autocomplete="current-password" />

        <Button type="submit" loading={auth.loading} class="w-full mt-4">
          Login
        </Button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?
          <button type="button" onclick={(e) => handleNavigate("/register", e)} class="font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer focus:outline-none bg-transparent border-0 p-0">Register here</button>
        </p>
      </div>
    </Card>
  </div>
</div>
