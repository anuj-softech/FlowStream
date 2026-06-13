<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    type = "button",
    variant = "primary",
    loading = false,
    disabled = false,
    form,
    onclick,
    children,
    class: className = ""
  }: {
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "outline";
    loading?: boolean;
    disabled?: boolean;
    form?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
    class?: string;
  } = $props();

  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl px-5 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/10 focus:ring-primary-500",
    secondary: "bg-secondary-600 hover:bg-secondary-500 text-white shadow-lg shadow-secondary-600/10 focus:ring-secondary-500",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10 focus:ring-rose-500",
    outline: "border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-primary-500"
  };
</script>

<button
  {type}
  {form}
  disabled={disabled || loading}
  {onclick}
  class="{baseStyles} {variantStyles[variant]} {className}"
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  {@render children?.()}
</button>
