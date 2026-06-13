<script lang="ts">
  import Input from "../../../../components/Input.svelte";
  import Button from "../../../../components/Button.svelte";
  import Card from "../../../../components/Card.svelte";
  import { Carta, MarkdownEditor } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";
  import { slash } from "@cartamd/plugin-slash";
  import { emoji } from "@cartamd/plugin-emoji";
  import { code } from "@cartamd/plugin-code";
  import { math } from "@cartamd/plugin-math";
  import { anchor } from "@cartamd/plugin-anchor";
  import { projectClient } from "$lib/transport.js";
  import { workspace } from "$lib/states/workspace.svelte.js";
  import { goto } from "$app/navigation";
  import "../../../../components/carta.css";

  let name = $state("");
  let description = $state("");
  let loading = $state(false);
  let error = $state("");

  const carta = new Carta({
    sanitizer: DOMPurify.sanitize,
    extensions: [
      slash(),
      emoji(),
      code(),
      math(),
      anchor()
    ]
  });

  async function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) {
      error = "Project name is required";
      return;
    }
    loading = true;
    error = "";
    try {
      const res = await projectClient.createProject({ name: name.trim(), description: description.trim() });
      await workspace.loadAllData();
      if (res.project) {
        goto(`/project/${res.project.id}`, { replaceState: true });
      } else {
        goto("/projects", { replaceState: true });
      }
    } catch (err: any) {
      error = err.message || "Failed to create project";
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-6">
  <div class="flex items-center gap-3">
    <a href="/projects" class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
      <span class="material-symbols-rounded text-lg">arrow_back</span>
      <span>Back to Projects</span>
    </a>
  </div>

  <Card class="p-6 sm:p-8 flex flex-col gap-6 shadow-md">
    <div class="flex flex-col gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
      <h3 class="text-xl font-bold dark:text-white font-heading">Create Collaborative Project</h3>
      <p class="text-xs text-slate-400">Initialize a new team workspace to start assigning tasks and building pipelines.</p>
    </div>

    {#if error}
      <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 select-none animate-fade-in">
        <span class="material-symbols-rounded text-base select-none">error</span>
        <span>{error}</span>
      </div>
    {/if}

    <form onsubmit={handleFormSubmit} class="flex flex-col gap-5">
      <Input id="newProjName" label="Project Name" required placeholder="E.g. Web App Redesign" bind:value={name} />
      
      <div class="flex flex-col gap-1.5">
        <label for="newProjDesc" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
        <div class="w-full">
          <MarkdownEditor {carta} bind:value={description} mode="tabs" theme="github" placeholder="Outline goals, objectives, or pipelines using Markdown..." />
        </div>
      </div>

      <div class="flex gap-4 pt-2">
        <Button type="submit" {loading} class="flex-1">Create Project</Button>
        <a href="/projects" class="flex-1">
          <Button variant="outline" type="button" class="w-full">Cancel</Button>
        </a>
      </div>
    </form>
  </Card>
</div>
