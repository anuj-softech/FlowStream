<script lang="ts">
  import Input from "../Input.svelte";
  import Button from "../Button.svelte";

  interface Props {
    profession: string;
    mobileNumber: string;
    profilePicUrl: string;
    loading: boolean;
    onBack: () => void;
  }

  let {
    profession = $bindable(),
    mobileNumber = $bindable(),
    profilePicUrl = $bindable(),
    loading,
    onBack
  }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input id="profession" label="Profession (Optional)" placeholder="Profession title" bind:value={profession} maxlength={100} />
    <Input id="mobileNumber" label="Mobile Number (Optional)" type="tel" placeholder="+91 99999XXXXX" bind:value={mobileNumber} maxlength={100} />
  </div>

  <Input id="profilePicUrl"  class="hidden" label="Profile Picture URL (Optional)" type="url" placeholder="Not Implemented" bind:value={profilePicUrl} maxlength={10000} />
  
  <div class="grid grid-cols-2 gap-4 mt-4">
    <Button variant="outline" onclick={onBack} type="button">
      Back
    </Button>
    <Button type="submit" {loading}>
      Register
    </Button>
  </div>
</div>
