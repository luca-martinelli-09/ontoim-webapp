<script>
  import Icon from "@iconify/svelte";
  import Navbar from "./Navbar.svelte";
  import Search from "./search/Search.svelte";

  const paName = import.meta.env.VITE_PA_NAME;
  const paUrl = import.meta.env.VITE_PA_URL;

  let opened;
  let toggleSearch = () => {
    opened = !opened;
  };
</script>

<svelte:head>
  <title>{paName} - Data Reports</title>
</svelte:head>

<header class="px-3 bg-black text-white py-3 font-monospace">
  <div class="grid grid-cols-2 sm:grid-cols-3 items-center max-w-screen-lg mx-auto">
    <a href={paUrl} target="_blank" rel="noopener noreferrer" class="text-lg hidden sm:block"><h1>{paName}</h1></a>
    <a href="/" class="sm:text-center"><h1 class="text-2xl">Data Reports</h1></a>
    <div class="flex justify-end">
      <button class="text-2xl" on:click={toggleSearch}>
        <Icon icon="ion:search-outline" />
      </button>
    </div>
  </div>
</header>

<Navbar />

{#if opened}
  <Search placeholder="Cerca..." {toggleSearch} />
{/if}
