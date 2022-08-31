<script>
  export let data;
</script>

<article class="prose">
  <h1>{ data.meta.title }</h1>
  <p>Published: {data.meta.date}</p>
  <svelte:component this={data.content} />
</article>