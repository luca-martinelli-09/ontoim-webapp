<script>
  export let report;
</script>

<a href={report.path} class="flex space-x-3 items-center border-b py-4 border-[#DFD8CA] last:border-0">
  {#if report.meta.thumb}
    <div>
      <img src={report.meta.thumb} alt={report.meta.title} class="w-32 aspect-video object-cover rounded-sm" />
    </div>
  {/if}
  <div class="flex flex-col space-y-1">
    <h2 class="text-2xl">{report.meta.title}</h2>
    <span class="font-sans text-sm opacity-70">{new Date(report.meta.date).toLocaleDateString()}</span>
  </div>
</a>
