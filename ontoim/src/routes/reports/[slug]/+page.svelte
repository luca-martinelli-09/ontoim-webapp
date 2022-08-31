<script>
  export let data;

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 5);
</script>

<div class="flex flex-col gap-3">
  <img src={data.meta.thumb} alt={data.meta.title} class="w-full max-h-96 object-cover" />
  <div class="flex flex-col gap-2">
    <div>
      <span class="font-sans text-xs opacity-70 {new Date(data.meta.date) > limitDate ? "font-bold px-1 y-2 bg-[#B91646] text-white rounded-sm" : ""}">{new Date(data.meta.date).toLocaleDateString()}</span>
    </div>
    <h1 class="text-4xl">{data.meta.title}</h1>
  </div>
  {#if data.meta.keywords}
    <p class="flex gap-1 flex-wrap">
      {#each data.meta.keywords as keyword}
        <span class="rounded-sm bg-[#105652] text-white font-sans px-2 py-1 text-xs capitalize font-bold">{keyword}</span>
      {/each}
    </p>
  {/if}
</div>

<article class="prose-lg mt-10">
  <svelte:component this={data.content} />
</article>
