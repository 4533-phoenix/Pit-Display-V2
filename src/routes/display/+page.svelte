<script lang="ts">
    import { type CarouselAPI } from "$lib/components/ui/carousel/context";
    import * as Carousel from "$lib/components/ui/carousel/index";
    import { onMount } from "svelte";
    import TbaApi from "$lib/tba";

    let carouselApi: CarouselAPI;
    let teamNumber = "";
    let teamData: TbaApi.Team;
    let teamMedia: TbaApi.Media[];
    let teamAvatar: TbaApi.Media | null | undefined;
    onMount(async () => {
        let queryTeamNumber = new URLSearchParams(window.location.search).get(
            "team",
        );
        try {
            teamNumber = queryTeamNumber || "";
            teamData = await TbaApi.TeamService.getTeam("frc" + teamNumber);

            let media = await TbaApi.TeamService.getTeamMediaByYear(
                "frc" + teamNumber,
                2024,
            );
            teamAvatar = media.find((media) => media.type === "avatar");
            teamMedia = media.filter((media) => media.type !== "avatar");
        } catch (error) {
            window.location.href = "/";
        }

        setInterval(async () => {
            teamData = await TbaApi.TeamService.getTeam("frc" + teamNumber);

            let media = await TbaApi.TeamService.getTeamMediaByYear(
                "frc" + teamNumber,
                2024,
            );
            teamAvatar = media.find((media) => media.type === "avatar");
            teamMedia = media.filter((media) => media.type !== "avatar");
        }, 10000);

        setInterval(() => {
            if (carouselApi.canScrollNext()) {
                carouselApi.scrollNext();
            } else {
                carouselApi.scrollTo(0);
            }
        }, 5000);
    });
</script>

<title>{teamNumber} ({teamData ? teamData.nickname : "..."}) Display</title>
<!-- get the avatar -->
{#if teamMedia}
    {#each teamMedia as media}
        {#if media.type === "avatar"}
            <img src={media.direct_url} alt="avatar" />
        {/if}
    {/each}
{/if}
<div
    class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
    <div class="max-w-md w-full space-y-8">
        <div>
            <h1 class="mt-6 text-center text-4xl font-extrabold">
                {teamData ? teamData.nickname : "Loading..."}
            </h1>
        </div>
        <div>
            <p class="text-center text-sm">
                {teamData ? teamData.team_number : "Loading..."}
            </p>
        </div>
        <Carousel.Root bind:api={carouselApi}>
            <Carousel.Content>
                {#if teamMedia}
                    {#each teamMedia as media}
                        <Carousel.Item>
                            <img src={media.direct_url} alt={media.type} />
                        </Carousel.Item>
                    {/each}
                {/if}
            </Carousel.Content>
        </Carousel.Root>
    </div>
</div>
