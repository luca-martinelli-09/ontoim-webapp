<script>
  export let report;
  export let style = "lg-top";

  const d = style.substring(0, 2);
  const p = style.substring(3);

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 5);

  let fontClass;
  let imageClass;
  let gridClass;
  let gapClass;

  switch (d) {
    case "sm":
      fontClass = "text-xl";
      imageClass = "w-32 h-full";
      gapClass = "gap-1";
      break;
    case "md":
      fontClass = "text-2xl";
      imageClass = "w-64 h-full";
      gapClass = "gap-1";
      break;
    default:
      fontClass = "text-3xl lg:text-4xl";
      imageClass = "w-full aspect-video";
      gapClass = "gap-2";
      break;
  }

  switch (p) {
    case "right":
      gridClass = "flex-row-reverse items-center";
      break;
    case "left":
      gridClass = "flex-row items-center";
      break;
    case "bottom":
      gridClass = "flex-col-reverse";
      break;
    default:
      gridClass = "flex-col";
      imageClass = "w-full";
      break;
  }

  imageClass = p == "top" ? "w-full" : imageClass;
</script>

<a href={report.path} class="flex {gridClass} gap-3">
  {#if report.meta.thumb}
    <div>
      <img src={report.meta.thumb} alt={report.meta.title} class="{imageClass} max-h-96 object-cover rounded-sm" />
    </div>
  {/if}
  <div class="flex flex-1 flex-col {gapClass}">
    <div>
      <span class="font-sans text-xs opacity-70 {new Date(report.meta.date) > limitDate ? "font-bold px-1 y-2 bg-[#B91646] text-white rounded-sm" : ""}">{new Date(report.meta.date).toLocaleDateString()}</span>
    </div>
    <h2 class="{fontClass} inline-flex items-center gap-4">
      <span>{report.meta.title}</span>
    </h2>
    {#if report.meta.keywords && d != "sm"}
      <p class="flex gap-1 mt-1 flex-wrap">
        {#each report.meta.keywords as keyword}
          <span class="rounded-sm bg-[#105652] text-white font-sans px-2 py-1 text-xs capitalize font-bold">{keyword}</span>
        {/each}
      </p>
    {/if}
  </div>
</a>
