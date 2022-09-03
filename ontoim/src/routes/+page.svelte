<script>
  import ReportElement from "$lib/components/ReportElement.svelte";
  import Icon from "@iconify/svelte";

  export let data;

  let fixedReports = data.reports.filter((r) => r.meta.fixed);
</script>

{#if fixedReports.length > 0}
  <div class="flex gap-3 mb-20">
    <div class="flex flex-1 gap-3 flex-nowrap overflow-auto pr-5">
      {#each fixedReports as report}
        <ReportElement {report} style="xs-top" />
      {/each}
    </div>
    <span class="text-2xl"><Icon icon="bi:pin-angle" /></span>
  </div>
{/if}

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
    {#each data.reports.slice(4, 10) as report}
      <ReportElement {report} style="sm-top" />
    {/each}
  </div>
{/if}
