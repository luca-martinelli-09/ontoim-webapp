<script>
  import { afterUpdate } from "svelte";
  import SearchResult from "./SearchResult.svelte";

  afterUpdate(() => {
    const input = document.getElementById("search-input");
    input.focus();
  });

  export let placeholder = "Cerca...";
  export let toggleSearch = () => {};

  let searchResults;

  async function searchReports(event) {
    const query = event.target.value;

    if (query.length > 3) {
      const search = await fetch("/api/reports?" + new URLSearchParams({ q: query }).toString());

      if (search.ok) {
        searchResults = await search.json();
      } else {
        searchResults = [];
      }
    } else {
      searchResults = null;
    }
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-30 overflow-auto pb-10 z-[9999]" on:click={toggleSearch}>
  <div on:click|stopPropagation class="mt-16 bg-background-light border-2 border-black max-w-screen-lg w-full mx-auto shadow-lg rounded-sm">
    <input on:input={searchReports} id="search-input" class="w-full bg-transparent outline-none py-3 px-5 font-sans placeholder:text-black" type="text" {placeholder} />

    {#if searchResults}
      <div class="py-3 mx-5 mt-2 border-t border-y-divider">
        {#if searchResults.length > 0}
          <div class="flex flex-col">
            {#each searchResults as report}
              <SearchResult {report} />
            {/each}
          </div>
        {:else}
          <div class="font-sans opacity-80 text-sm">Nessun risultato trovato</div>
        {/if}
      </div>
    {/if}
  </div>
</div>
