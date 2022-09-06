<script>
  import { afterUpdate, onMount } from "svelte";

  export let height = "500px";
  export let option;

  let el;
  let chart;

  onMount(async () => {
    const echarts = await import("echarts");

    chart = echarts.init(el);

    chart.setOption(option);
  });

  afterUpdate(() => {
    chart?.setOption(option)
  })
</script>

<svelte:window on:resize={() => chart.resize()} />

<div class="w-full overflow-hidden">
  <div bind:this={el} style="height: {height}" />
</div>
