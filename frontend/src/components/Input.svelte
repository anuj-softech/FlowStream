<script lang="ts">
  let {
    id,
    label,
    type = "text",
    value = $bindable(""),
    placeholder = "",
    required = false,
    error = "",
    success = "",
    maxlength,
    allowPaste = true,
    autocomplete = "",
    class: className = ""
  }: {
    id: string;
    label: string;
    type?: "text" | "email" | "password" | "tel" | "url";
    value?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    success?: string;
    maxlength?: number;
    allowPaste?: boolean;
    autocomplete?: any;
    class?: string;
  } = $props();

  let isPasswordVisible = $state(false);
  let inputType = $derived(type === "password" && isPasswordVisible ? "text" : type);
</script>

<div class="flex flex-col gap-1.5 {className}">
  <label for={id} class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {label}
    {#if required}
      <span class="text-rose-500">*</span>
    {/if}
  </label>
  <div class="relative">
    <input
      {id}
      type={inputType}
      bind:value
      {placeholder}
      {required}
      {maxlength}
      {autocomplete}
      onpaste={allowPaste ? undefined : (e) => e.preventDefault()}
      class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-4 py-3 text-sm text-slate-950 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all
        {type === 'password' ? 'pr-11' : 'pr-4'}
        {error ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' :
         success ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' :
         'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}"
    />
    {#if type === "password"}
      <button
        type="button"
        onclick={() => isPasswordVisible = !isPasswordVisible}
        class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer p-1.5 rounded-lg flex items-center justify-center transition-colors"
      >
        <span class="material-symbols-rounded text-lg block select-none">
          {isPasswordVisible ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    {/if}
  </div>
  {#if error}
    <span class="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-0.5">{error}</span>
  {:else}
    {#if success}
      <span class="text-[11px] font-medium text-emerald-500 dark:text-emerald-400 mt-0.5">{success}</span>
    {/if}
  {/if}
</div>
