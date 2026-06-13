<script lang="ts">
  import Input from "../Input.svelte";
  import Button from "../Button.svelte";

  interface Props {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    usernameChecking: boolean;
    usernameAvailable: boolean | null;
    usernameError: string;
    confirmPasswordError: string;
    isStep1Valid: () => boolean;
    onNext: () => void;
  }

  let {
    name = $bindable(),
    username = $bindable(),
    email = $bindable(),
    password = $bindable(),
    confirmPassword = $bindable(),
    usernameChecking,
    usernameAvailable,
    usernameError,
    confirmPasswordError,
    isStep1Valid,
    onNext
  }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input id="name" label="Full Name" required placeholder="Full name" bind:value={name} autocomplete="name" />
    
    <Input
      id="username"
      label="Username"
      required
      placeholder="username"
      bind:value={username}
      autocomplete="username"
      error={usernameError || (usernameAvailable === false ? "Username is taken" : "")}
      success={usernameChecking ? "Checking availability..." : (usernameAvailable === true ? "Username is available" : "")}
    />
  </div>

  <Input id="email" label="Email Address" type="email" required placeholder="name@domain.com" bind:value={email} autocomplete="email" />
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input id="password" label="Password" type="password" required placeholder="••••••••" bind:value={password} allowPaste={false} autocomplete="new-password" />
    <Input id="confirmPassword" label="Confirm Password" type="password" required placeholder="••••••••" bind:value={confirmPassword} error={confirmPasswordError} allowPaste={false} autocomplete="new-password" />
  </div>
  
  <Button onclick={onNext} type="button" class="w-full mt-4" disabled={!isStep1Valid()}>
    Next Step
  </Button>
</div>
