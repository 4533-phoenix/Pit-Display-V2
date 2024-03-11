<script lang="ts">
    import { Input } from "$lib/components/ui/input/index";
    import { Button } from "$lib/components/ui/button/index";
    import TbaApi from "$lib/tba";

    async function validateTeamNumber() {
        buttonDisabled = true;
        
        try {
            await TbaApi.TeamService.getTeam("frc" + teamNumber);
            window.location.href = `/display?team=${teamNumber}`;
        } catch (error) {
            alert("Invalid team number");
            buttonDisabled = false;
        }
    }

    let teamNumber = "";
    let buttonDisabled = false;
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h1 class="mt-6 text-center text-4xl font-extrabold ">
                FRC Pit Display
            </h1>
        </div>
        <div>
            <p class="text-center text-sm ">
                Enter your team number below to get started.
            </p>
        </div>
        <Input placeholder="Team Number" bind:value={teamNumber} type="number" />
        <Button class="w-full" on:click={validateTeamNumber} disabled={buttonDisabled}>Go</Button>
    </div>
</div>