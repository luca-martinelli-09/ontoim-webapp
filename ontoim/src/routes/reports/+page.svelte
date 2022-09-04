<script>
  import ReportElement from "$lib/components/ReportElement.svelte";
  import Icon from "@iconify/svelte";

  export let data;

  let fixedReports = data.reports.filter((r) => r.meta.fixed);
</script>

{#if fixedReports.length > 0}
  <div class="flex gap-3 mb-20">
    <div class="flex flex-1 gap-3 flex-nowrap overflow-auto pr-5 pb-5">
      {#each fixedReports as report}
        <ReportElement {report} style="xs-top" />
      {/each}
    </div>
    <span class="text-2xl"><Icon icon="bi:pin-angle" /></span>
  </div>
{/if}

<div class="lg:col-span-2">
  <ReportElement report={data.reports[0]} style="lg-top" />
</div>

<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-7 md:mt-16">
  {#each data.reports.slice(1) as report}
    <ReportElement {report} style="md-top" />
  {/each}
</div>
