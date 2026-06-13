<script lang="ts">
  import Card from "../../../components/Card.svelte";
  import Button from "../../../components/Button.svelte";
  import Input from "../../../components/Input.svelte";
  import { auth } from "$lib/hooks/auth.svelte.js";

  let isEditing = $state(false);
  let editName = $state("");
  let editUsername = $state("");
  let editProfession = $state("");
  let editMobile = $state("");
  let editPicUrl = $state("");

  let error = $state("");
  let success = $state("");
  let loading = $state(false);

  function syncEditFields() {
    if (auth.currentUser) {
      editName = auth.currentUser.name;
      editUsername = auth.currentUser.username;
      editProfession = auth.currentUser.profession || "";
      editMobile = auth.currentUser.mobileNumber || "";
      editPicUrl = auth.currentUser.profilePicUrl || "";
    }
  }

  function handleStartEdit() {
    syncEditFields();
    isEditing = true;
    error = "";
    success = "";
  }

  function handleCancelEdit() {
    isEditing = false;
    error = "";
    success = "";
  }

  async function handleSave(e: SubmitEvent) {
    e.preventDefault();
    error = "";
    success = "";

    const targetUsername = editUsername.trim();
    if (!/^[a-z0-9]+$/.test(targetUsername)) {
      error = "Username can only contain lowercase letters and numbers";
      return;
    }

    loading = true;
    try {
      const ok = await auth.updateProfile({
        name: editName.trim(),
        username: targetUsername,
        profession: editProfession.trim(),
        mobileNumber: editMobile.trim(),
        profilePicUrl: editPicUrl.trim()
      });

      if (ok) {
        success = "Profile updated successfully";
        isEditing = false;
      } else {
        error = auth.error || "Failed to update profile";
      }
    } catch (err: any) {
      error = err.message || "Failed to update profile";
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-1.5">
    <h1 class="text-3xl font-extrabold tracking-tight font-heading">
      Settings
    </h1>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Manage your profile settings and view technical configuration.
    </p>
  </div>

  {#if auth.currentUser}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      <div class="lg:col-span-6 flex flex-col gap-6">
        <Card class="p-6 flex flex-col gap-6">
          <h3 class="text-base font-bold flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">person</span>
            <span>User Profile Settings</span>
          </h3>

          {#if success}
            <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 select-none">
              <span class="material-symbols-rounded text-base select-none">check_circle</span>
              <span>{success}</span>
            </div>
          {/if}

          {#if error}
            <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 select-none">
              <span class="material-symbols-rounded text-base select-none">error</span>
              <span>{error}</span>
            </div>
          {/if}

          {#if !isEditing}
            <div class="flex flex-col gap-5">
              <div class="flex items-center gap-4">
                {#if auth.currentUser.profilePicUrl}
                  <img
                    src={auth.currentUser.profilePicUrl}
                    alt={auth.currentUser.name}
                    class="w-16 h-16 rounded-2xl object-cover border-2 border-primary-500 shadow-md animate-fade-in"
                  />
                {:else}
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center font-bold text-xl text-white shadow-md">
                    {auth.currentUser.name.charAt(0).toUpperCase()}
                  </div>
                {/if}
                
                <div class="flex flex-col">
                  <h4 class="font-bold text-slate-800 dark:text-white">{auth.currentUser.name}</h4>
                  <span class="text-xs text-slate-450">@{auth.currentUser.username}</span>
                </div>
              </div>

              <div class="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 font-sans">
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                  <span class="text-xs font-medium">{auth.currentUser.email}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profession</span>
                  <span class="text-xs font-medium">{auth.currentUser.profession || "Not provided"}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</span>
                  <span class="text-xs font-medium">{auth.currentUser.mobileNumber || "Not provided"}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Created</span>
                  <span class="text-xs font-medium">{new Date(auth.currentUser.dateCreated).toLocaleDateString()}</span>
                </div>

                <Button variant="outline" onclick={handleStartEdit} class="w-full mt-2 font-bold">
                  Edit Profile
                </Button>
              </div>
            </div>
          {:else}
            <form onsubmit={handleSave} class="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <Input id="editName" label="Full Name" required placeholder="John Doe" bind:value={editName} />
              <Input id="editUsername" label="Username" required placeholder="johndoe" bind:value={editUsername} />
              <Input id="editProfession" label="Profession" placeholder="Software Engineer" bind:value={editProfession} />
              <Input id="editMobile" label="Mobile Number" placeholder="+1 (555) 000-0000" bind:value={editMobile} />
              <Input id="editPicUrl" label="Profile Picture URL" placeholder="https://example.com/pic.jpg" bind:value={editPicUrl} />

              <div class="flex gap-3 mt-2">
                <Button type="submit" {loading} class="flex-1 font-bold">
                  Save
                </Button>
                <Button variant="outline" onclick={handleCancelEdit} class="flex-1 font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          {/if}
        </Card>
      </div>
    </div>
  {/if}
</div>
