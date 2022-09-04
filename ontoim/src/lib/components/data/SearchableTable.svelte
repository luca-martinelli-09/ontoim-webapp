<script>
  import Icon from "@iconify/svelte";
  import Message from "../Message.svelte";
  import Table from "./Table.svelte";

  export let headers;
  export let data;
  export let openModal;

  export let customAction;
  export let customActionIcon;

  let filteredData = [];

  function filterData(e) {
    const query = e.target.value.toLowerCase();

    if (query.length > 2) {
      filteredData = data.filter((el) => {
        for (const k of headers) {
          if (el[k]?.toLowerCase().includes(query)) {
            return true;
          }
        }
        return false;
      });
    } else {
      filteredData = [];
    }
  }
</script>

<div class="flex items-center bg-background-light px-3 gap-3 rounded-sm border-2 border-black placeholder:text-black mb-4">
  <input on:input={filterData} type="text" class="flex-1 bg-transparent py-2 outline-none placeholder:text-black font-sans" placeholder="Cerca..." />
  <span class="text-xl">
    <Icon icon="ion:search-outline" />
  </span>
</div>

{#if filteredData.length > 0}
  <Table {headers} data={filteredData} {openModal} {customAction} {customActionIcon} />
{:else}
  <Message message="Nessun risultato da elencare. Inizia a cercare o prova a cambiare ricerca." />
{/if}
