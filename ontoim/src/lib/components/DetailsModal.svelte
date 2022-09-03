<script>
  import Icon from "@iconify/svelte";

  export let close;
  export let title;
</script>

<div class="fixed inset-0 bg-black bg-opacity-30 overflow-auto pb-10 z-50" on:click={close}>
  <div on:click|stopPropagation class="mt-16 bg-background-light border-2 border-black max-w-screen-lg w-full mx-auto shadow-lg rounded-sm p-5">
    <div class="flex items-center mb-5 justify-between">
      {#if title}
        <h3 class="m-0">{title}</h3>
      {:else}
        <div />
      {/if}
      <button on:click={close} class="text-3xl"><Icon icon="ion:close-outline" /></button>
    </div>
    <slot />
  </div>
</div>
