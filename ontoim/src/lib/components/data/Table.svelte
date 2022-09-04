<script>
  import Icon from "@iconify/svelte";

  export let headers;
  export let data;
  export let openModal;

  export let customAction;
  export let customActionIcon;

  export let showFoot = true;

  function handleAction(event) {
    const el = data[event.currentTarget.dataset.id];
    if (customAction) {
      customAction(el);
    } else {
      openModal(el);
    }
  }
</script>

{#if data && headers}
  <div class="overflow-x-auto relative">
    <table class="w-full text-sm font-sans text-left">
      <thead class="text-xs uppercase">
        <tr class="border-b-2 border-black">
          {#each headers as header}
            <th scope="col" class="py-2 px-6">{header.replace("__", " ")}</th>
          {/each}
          {#if openModal || customAction}
            <th scole="col" class="w-0" />
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each data as row, i}
          <tr class="border-b border-divider">
            <th scope="col" class="py-2 px-6 font-bold">{row[headers[0]] ? row[headers[0]].trim() : ""}</th>
            {#each headers.slice(1) as h}
              <td class="py-2 px-6">{row[h] ? row[h].trim() : ""}</td>
            {/each}
            {#if openModal || customAction}
              <td scole="col" class="w-0 py-2 px-6 align-bottom">
                <button on:click={handleAction} data-id={i} class="text-2xl text-blue-800 align-bottom">
                  <Icon icon={customActionIcon || "ion:information-circle-outline"} />
                </button>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
      {#if showFoot}
        <tfoot>
          <tr class="border-t-2 border-black">
            <th scope="col" class="py-2 px-6">Totale: {data.length}</th>
          </tr>
        </tfoot>
      {/if}
    </table>
  </div>
{/if}
