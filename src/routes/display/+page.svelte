<script lang="ts">
  import Autoplay from "embla-carousel-autoplay";
  import * as Carousel from "$lib/components/ui/carousel/index";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { onMount } from "svelte";
  import { validateTeamNumber } from "$lib/frc";
  import TbaApi from "$lib/tba";

  let carouselApi: CarouselAPI;
  let teamNumber = "";

  let tbaStatus: TbaApi.API_Status;
  let teamData: TbaApi.Team;
  let teamMedia: TbaApi.Media[];
  let teamAvatar: TbaApi.Media | null | undefined;

  async function updateData() {
    tbaStatus = await TbaApi.TbaService.getStatus();
    teamData = await TbaApi.TeamService.getTeam("frc" + teamNumber);

    let media = await TbaApi.TeamService.getTeamMediaByYear(
      "frc" + teamNumber,
      tbaStatus.current_season,
    );
    teamAvatar = media.find((media) => media.type === "avatar");
    teamMedia = media.filter((media) => media.type !== "avatar");
  }

  onMount(async () => {
    let query = new URLSearchParams(window.location.search);
    try {
      teamNumber = query.get("team") || "";

      if (!validateTeamNumber(teamNumber)) {
        throw new Error("Invalid team number");
      }

      updateData();
    } catch (error) {
      window.location.href = "/";
    }

    setInterval(updateData, 1000 * 60 * 10);
  });
</script>

{#if teamAvatar}
  <link
    rel="icon"
    type="image/png"
    href={"data:image/png;base64," + teamAvatar.details.base64Image}
  />
{/if}
<title>{teamNumber} ({teamData ? teamData.nickname : "..."}) Display</title>

<div
  class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div>
      {#if teamData}
        <h1 class="mt-6 text-center text-4xl font-extrabold h-12">
          {teamData ? teamData.nickname : "Loading..."}
        </h1>
        <p class="text-center text-sm h-12">
          {teamData ? teamData.team_number : "Loading..."}
        </p>
      {:else}
        <Skeleton class="mt-6 text-center text-4xl font-extrabold h-12" />
        <Skeleton class="text-center text-sm h-12" />
      {/if}
    </div>
    {#if teamMedia}
      <Carousel.Root
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false 
          }),
        ]}
        class="w-full h-96 overflow-hidden"
      >
        <Carousel.Content>
          {#if teamMedia}
            {#each teamMedia as media}
              <Carousel.Item>
                <!-- <img src={media.direct_url} alt={media.type} /> -->
                <!-- crop to center of the image -->
                <div
                  class="w-full h-96 bg-cover bg-center"
                  style="background-image: url({media.direct_url})"
                ></div>
              </Carousel.Item>
            {/each}
          {/if}
        </Carousel.Content>
      </Carousel.Root>
    {:else}
      <Skeleton class="w-full h-96" />
    {/if}
  </div>
</div>
