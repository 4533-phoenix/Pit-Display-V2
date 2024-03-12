<script lang="ts">
  import { Input } from "$lib/components/ui/input/index";
  import { Button } from "$lib/components/ui/button/index";
  import { validateTeamNumber } from "$lib/frc";

  function click() {
    inputDisabled = true;
    if (validateTeamNumber(teamNumber)) {
      window.location.href = `display?team=${teamNumber}`;
    } else {
      alert("Invalid team number");
      inputDisabled = false;
    }
  }

  function keyup(event: KeyboardEvent) {
    if (event.key === "Enter") {
      click();
    }
  }

  let teamNumber = "";
  let inputDisabled = false;
</script>

<title>FRC Pit Display</title>
<div
  class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div>
      <h1 class="mt-6 text-center text-4xl font-extrabold">FRC Pit Display</h1>
    </div>
    <div>
      <p class="text-center text-sm">
        Enter your team number below to get started.
      </p>
    </div>
    <Input
      placeholder="Team Number"
      bind:value={teamNumber}
      disabled={inputDisabled}
      on:keyup={keyup}
      type="number"
    />
    <Button class="w-full" on:click={click} disabled={inputDisabled}>Go</Button>
  </div>
</div>
