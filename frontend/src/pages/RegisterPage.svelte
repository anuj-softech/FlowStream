<script lang="ts">
  import { auth } from "$lib/hooks/auth.svelte.js";
  import { goto } from "$app/navigation";
  import Card from "../components/Card.svelte";
  import CredentialsStep from "../components/register/CredentialsStep.svelte";
  import ProfileStep from "../components/register/ProfileStep.svelte";

  let name = $state("");
  let username = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let profession = $state("");
  let mobileNumber = $state("");
  let profilePicUrl = $state("");

  let currentStep = $state(1);

  let usernameChecking = $state(false);
  let usernameAvailable = $state<boolean | null>(null);
  let usernameError = $state("");

  let formError = $state("");
  let formSuccess = $state("");

  let confirmPasswordError = $derived(
    confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""
  );

  $effect(() => {
    const target = username.trim();
    if (!target) {
      usernameChecking = false;
      usernameAvailable = null;
      usernameError = "";
      return;
    }
    if (!/^[a-z0-9]+$/.test(target)) {
      usernameChecking = false;
      usernameAvailable = false;
      usernameError = "Only lowercase letters and numbers are allowed";
      return;
    }
    usernameChecking = true;
    usernameAvailable = null;
    usernameError = "";
    const timer = setTimeout(async () => {
      try {
        usernameAvailable = await auth.checkUsername(target);
      } catch {
        usernameError = "Checking failed";
      } finally {
        usernameChecking = false;
      }
    }, 350);
    return () => clearTimeout(timer);
  });
  function isStep1Valid() {
    return (
      name.trim() !== "" &&
      name.length <= 100 &&
      username.trim() !== "" &&
      username.length <= 100 &&
      /^[a-z0-9]+$/.test(username) &&
      email.trim() !== "" &&
      email.length <= 100 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      password.length >= 8 &&
      password.length <= 100 &&
      confirmPassword.trim() !== "" &&
      password === confirmPassword &&
      usernameAvailable === true &&
      !usernameChecking
    );
  }

  function handleNextStep() {
    if (name.length > 100) {
      formError = "Name cannot exceed 100 characters";
      return;
    }
    if (username.length > 100) {
      formError = "Username cannot exceed 100 characters";
      return;
    }
    if (email.length > 100) {
      formError = "Email cannot exceed 100 characters";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formError = "Invalid email format";
      return;
    }
    if (password.length < 8) {
      formError = "Password must be at least 8 characters long";
      return;
    }
    if (password.length > 100) {
      formError = "Password cannot exceed 100 characters";
      return;
    }
    if (!isStep1Valid()) {
      if (usernameAvailable === false) {
        formError = "Please select a different username";
      } else {
        formError = "Please fill in all required fields correctly";
      }
      return;
    }
    formError = "";
    currentStep = 2;
  }

  function handlePrevStep() {
    formError = "";
    currentStep = 1;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    formError = "";
    formSuccess = "";

    if (!isStep1Valid()) {
      currentStep = 1;
      formError = "Please fill in required credentials first";
      return;
    }

    if (profession.length > 100) {
      formError = "Profession cannot exceed 100 characters";
      return;
    }
    if (mobileNumber.length > 100) {
      formError = "Mobile number cannot exceed 100 characters";
      return;
    }
    if (profilePicUrl.length > 10000) {
      formError = "Profile picture URL cannot exceed 10000 characters";
      return;
    }

    const success = await auth.register({
      name,
      username: username.toLowerCase().trim(),
      email,
      password,
      profession: profession.trim() || undefined,
      mobileNumber: mobileNumber.trim() || undefined,
      profilePicUrl: profilePicUrl.trim() || undefined
    });

    if (success) {
      formSuccess = "Account registered successfully! Redirecting to login page...";
      setTimeout(() => {
        goto("/login", { replaceState: true });
      }, 1500);
    } else {
      formError = auth.error || "Failed to create account";
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

  <Card class="w-full max-w-5xl h-full max-h-[660px] grid grid-cols-1 lg:grid-cols-12 z-10 overflow-hidden shadow-lg">
    <div class="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between h-full overflow-y-auto custom-scrollbar">
      <div>
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-2.5">
            <img src="/logo.svg" alt="FlowStream Logo" class="w-8 h-8 rounded-lg select-none object-contain" />
            <span class="text-md font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              FlowStream
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Step {currentStep} of 2</span>
          </div>
        </div>

        <div class="w-full flex items-center gap-2 mb-6">
          <div class="flex-1 h-1 rounded-full bg-primary-600"></div>
          <div class="flex-1 h-1 rounded-full {currentStep === 2 ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'} transition-colors duration-300"></div>
        </div>

        <div class="flex flex-col gap-1.5 mb-6">
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentStep === 1 ? "Create your account" : "Complete your profile"}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {currentStep === 1 ? "Enter your mandatory credentials to sign up" : "Provide optional details to help teams find you"}
          </p>
        </div>

        {#if formError}
          <div class="p-3.5 mb-6 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <span class="material-symbols-rounded text-base select-none">error</span>
            <span>{formError}</span>
          </div>
        {/if}

        {#if formSuccess}
          <div class="p-3.5 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <span class="material-symbols-rounded text-base select-none">check_circle</span>
            <span>{formSuccess}</span>
          </div>
        {/if}

        <form onsubmit={handleSubmit} class="w-full">
          {#if currentStep === 1}
            <CredentialsStep
              bind:name
              bind:username
              bind:email
              bind:password
              bind:confirmPassword
              {usernameChecking}
              {usernameAvailable}
              {usernameError}
              {confirmPasswordError}
              {isStep1Valid}
              onNext={handleNextStep}
            />
          {:else}
            <ProfileStep
              bind:profession
              bind:mobileNumber
              bind:profilePicUrl
              loading={auth.loading}
              onBack={handlePrevStep}
            />
          {/if}
        </form>
      </div>

      <div class="mt-6 text-center">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Already registered?
          <button type="button" onclick={(e) => handleNavigate("/login", e)} class="font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer focus:outline-none bg-transparent border-0 p-0">Login here</button>
        </p>
      </div>
    </div>

    <div class="hidden lg:flex lg:col-span-5 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden h-full">
      <img
        src="/placeholder.png"
        alt="Project dashboard"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="z-20 flex flex-col gap-3">
        <h3 class="text-2xl font-bold font-heading">Simplify Project Management</h3>
        <p class="text-slate-300 text-sm leading-relaxed">
          Manage tasks, collaborate with team members, and stay on top of your projects with FlowStream.
        </p>
      </div>
    </div>
  </Card>
</div>
