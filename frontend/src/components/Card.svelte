<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    class: className = ""
  }: {
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<div class="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 {className}">
  {@render children?.()}
</div>
