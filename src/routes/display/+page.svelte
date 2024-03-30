<script lang="ts">
  import type { CarouselAPI } from "$lib/components/ui/carousel/context";
  import * as Carousel from "$lib/components/ui/carousel/index";
  import { Skeleton } from "$lib/components/ui/skeleton/index";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Card from "$lib/components/ui/card";

  import { Camera } from "lucide-svelte";

  import { onMount } from "svelte";
  import { validateTeamNumber } from "$lib/frc";
  import TbaApi from "$lib/tba";

  let teamNumber = "";

  let tbaStatus: TbaApi.API_Status;
  let teamData: TbaApi.Team;
  let teamAwards: TbaApi.Award[];
  let teamEvents: TbaApi.Event[];
  let teamCurrentEvent: TbaApi.Event | null | undefined;
  let teamMatches: TbaApi.Match[];
  let teamNextMatch: TbaApi.Match | null | undefined;
  let teamLastMatch: TbaApi.Match | null | undefined;
  let teamMedia: TbaApi.Media[];
  let teamAvatar: TbaApi.Media | null | undefined;

  let carouselApi: CarouselAPI;

  async function slowUpdate() {
    [tbaStatus, teamData] = await Promise.all([
      TbaApi.TbaService.getStatus(),
      TbaApi.TeamService.getTeam("frc" + teamNumber),
    ]);

    [teamEvents] = await Promise.all([
      TbaApi.TeamService.getTeamEventsByYear(
        teamData.key,
        tbaStatus.current_season,
      ),
    ]);
  }

  async function mediumUpdate() {
    [teamAwards, teamMedia] = await Promise.all([
      TbaApi.TeamService.getTeamAwardsByYear(
        teamData.key,
        tbaStatus.current_season,
      ),
      TbaApi.TeamService.getTeamMediaByYear(
        teamData.key,
        tbaStatus.current_season,
      ),
    ]);

    teamCurrentEvent = teamEvents.find(
      (event) =>
        Date.parse(event.end_date) + 1000 * 60 * 60 * 24 > Date.now() &&
        Date.parse(event.start_date) < Date.now(),
    );
    teamAvatar = teamMedia.find((media) => media.type === "avatar");
    console.log(teamEvents);
    teamCurrentEvent = teamEvents[0];
  }

  async function fastUpdate() {
    [teamMatches] = await Promise.all([
      TbaApi.TeamService.getTeamMatchesByYear(
        teamData.key,
        tbaStatus.current_season,
      ),
    ]);

    teamMatches.sort((a, b) => {
      if (a.time && b.time) {
        return a.time - b.time;
      } else if (a.time) {
        return -1;
      } else if (b.time) {
        return 1;
      } else {
        return 0;
      }
    });

    teamNextMatch = teamMatches.find(
      (match) =>
        !match.actual_time &&
        match.time &&
        new Date(match.time * 1000) > new Date(),
    );
    teamNextMatch = teamMatches[0];
    teamLastMatch = teamMatches.find(
      (match) =>
        match.actual_time && new Date(match.actual_time * 1000) < new Date(),
    );
  }

  async function forceUpdate() {
    await slowUpdate();
    await mediumUpdate();
    await fastUpdate();
  }

  onMount(async () => {
    let query = new URLSearchParams(window.location.search);
    teamNumber = query.get("team") || "";

    if (!validateTeamNumber(teamNumber)) {
      window.location.href = "/";
    }

    // setInterval(() => {
    //   carouselApi?.scrollNext();
    // }, 1000);

    forceUpdate();
    setInterval(slowUpdate, 1000 * 60 * 60 * 24); // 24 hours
    setInterval(mediumUpdate, 1000 * 60 * 60); // 1 hour
    setInterval(fastUpdate, 1000 * 60); // 1 minute
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

<!-- make a full screen carosel -->
<Carousel.Root bind:api={carouselApi} opts={{ loop: true }}>
  <Carousel.Content>
    <Carousel.Item>
      <div class="w-screen h-screen p-4">
        <div class="grid grid-rows-[200px-auto] gap-4">
          <div class="row-span-1 grid grid-cols-3 gap-4">
            <div class="col-span-1 flex flex-col justify-start items-start">
              {#if teamData}
                <h1 class="text-4xl font-extrabold h-10">
                  {teamData.nickname}
                </h1>
              {:else}
                <Skeleton class="text-4xl font-extrabold h-10" />
              {/if}
              <h2 class="text-2xl font-bold h-8">{teamNumber}</h2>
            </div>
            <div class="col-span-1 flex justify-center items-center">
              <Avatar.Root>
                {#if teamAvatar}
                  <Avatar.Image
                    src={"data:image/png;base64," +
                      teamAvatar.details.base64Image}
                    alt={"@" + teamData.name}
                  />
                {/if}
                <Avatar.Fallback>{teamNumber}</Avatar.Fallback>
              </Avatar.Root>
            </div>
            <div class="col-span-1 flex flex-col justify-start items-end">
              {#if teamCurrentEvent}
                <h1 class="text-4xl font-extrabold h-10">
                  {teamCurrentEvent.short_name +
                    (teamCurrentEvent.district
                      ? " (" + teamCurrentEvent.district.display_name + ")"
                      : "")}
                </h1>
              {:else if teamCurrentEvent === null}
                <h1 class="text-4xl font-extrabold h-10">No Current Event</h1>
              {:else}
                <Skeleton class="text-4xl font-extrabold h-10" />
              {/if}
            </div>
          </div>
          <div class="row-span-2 grid grid-cols-3 gap-4">
            <div class="col-span-1 flex flex-col justify-start items-start">
              <Card.Root>
                <Card.Header>
                  <Card.Title>Next Match</Card.Title>
                </Card.Header>
                <Card.Content>
                  <Card.Root>
                    <Card.Header>
                      <Card.Title>Predicted Time</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      {#if teamNextMatch && teamNextMatch.predicted_time}
                        <p class="text-xl">
                          {new Date(
                            teamNextMatch.predicted_time * 1000,
                          ).toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })}
                        </p>
                      {:else}
                        <Skeleton class="text-xl" />
                      {/if}
                    </Card.Content>
                  </Card.Root>
                  <Card.Root>
                    <Card.Header>
                      <Card.Title>Alliances</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      {#if teamNextMatch && teamNextMatch.alliances}
                        {#if teamNextMatch.alliances.blue}
                          <p class="text-xl bg-blue-500">
                            {teamNextMatch.alliances.blue.team_keys
                              .join(", ")
                              .replace("frc", "")}
                          </p>
                        {:else}
                          <Skeleton class="text-xl bg-blue-500" />
                        {/if}
                        {#if teamNextMatch.alliances.red}
                          <p class="text-xl bg-red-500">
                            {teamNextMatch.alliances.red.team_keys
                              .join(", ")
                              .replace("frc", "")}
                          </p>
                        {:else}
                          <Skeleton class="text-xl bg-red-500" />
                        {/if}
                      {:else}
                        <Skeleton class="text-xl" />
                      {/if}
                    </Card.Content>
                  </Card.Root>
                </Card.Content>
              </Card.Root>
            </div>
          </div>
        </div>
      </div>
    </Carousel.Item>
    <Carousel.Item>
      <div class="w-screen h-screen"></div>
    </Carousel.Item>
    <Carousel.Item>
      <div class="w-screen h-screen p-4">
        <Tabs.Root value="1" class="w-full h-full">
          <Tabs.List class="w-full flex">
            {#if teamCurrentEvent && teamCurrentEvent.webcasts}
              {#each { length: teamCurrentEvent.webcasts.length } as _, i}
                <Tabs.Trigger class="flex-1" value={"" + (i + 1)}
                  >{i + 1}</Tabs.Trigger
                >
              {/each}
            {:else}
              <Tabs.Trigger class="flex-1" value="1">1</Tabs.Trigger>
            {/if}
          </Tabs.List>
          {#if teamCurrentEvent && teamCurrentEvent.webcasts}
            {#each { length: teamCurrentEvent.webcasts.length } as _, i}
              <Tabs.Content value={"" + (i + 1)} class="h-full">
                {@const webcast = teamCurrentEvent.webcasts[i]}
                <h1>{webcast.type}</h1>
                <h2>{webcast.channel}</h2>
              </Tabs.Content>
            {/each}
          {:else}
            <Tabs.Content value="1" class="h-full">
              <div class="flex flex-col justify-center items-center h-full">
                <h1 class="text-4xl font-extrabold h-10">
                  No Webcasts Available
                </h1>
                <Camera class="w-24 h-24" />
              </div>
            </Tabs.Content>
          {/if}
        </Tabs.Root>
      </div>
    </Carousel.Item>
    <Carousel.Item>
      <div class="w-screen h-screen"></div>
    </Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
