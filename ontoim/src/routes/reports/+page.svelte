<script>
  import ReportElement from "$lib/components/ReportElement.svelte";
  export let data;
</script>

<div class="lg:col-span-2">
  <ReportElement report={data.reports[0]} style="lg-top" />
</div>

<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-7 md:mt-16">
  {#each data.reports.slice(1) as report}
    <ReportElement {report} style="md-top" />
  {/each}
</div>
