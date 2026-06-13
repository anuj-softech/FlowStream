<script lang="ts">
  import { onMount } from "svelte";

  let isDark = $state(false);

  onMount(() => {
    isDark = localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  function toggle() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }
</script>

<button
  onclick={toggle}
  type="button"
  class="relative flex items-center  justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
>
  <span class="sr-only">Toggle theme</span>
  {#if isDark}
    <span class="material-symbols-rounded text-xl block select-none">light_mode</span>
  {:else}
    <span class="material-symbols-rounded text-xl block select-none">dark_mode</span>
  {/if}
</button>
