<script>
  import ReportElement from "$lib/components/ReportElement.svelte";
  export let data;
</script>

{#if data.reports.length > 1}
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
    <div class="lg:col-span-2">
      <ReportElement report={data.reports[0]} style="lg-top" />
    </div>
    <div class="flex flex-col gap-7">
      {#each data.reports.slice(1, 4) as report}
        <ReportElement {report} style="sm-right" />
      {/each}
    </div>
  </div>
{:else}
  <ReportElement report={data.reports[0]} style="lg-top" />
{/if}

{#if data.reports.length > 4}
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-7 md:mt-16 border-t border-divider pt-10">
    {#each data.reports.slice(5, 11) as report}
      <ReportElement {report} style="sm-top" />
    {/each}
  </div>
{/if}
