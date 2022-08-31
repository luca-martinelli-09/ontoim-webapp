<script>
  export let report;
  export let style = "lg-top";

  const d = style.substring(0, 2);
  const p = style.substring(3);

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 5);

  let fontSize;
  let imageSize;
  let gridStyle;
  let gap;

  switch (d) {
    case "sm":
      fontSize = "text-xl";
      imageSize = "w-32 h-full";
      gap = "1";
      break;
    case "md":
      fontSize = "text-2xl";
      imageSize = "w-64 h-full";
      gap = "1";
      break;
    default:
      fontSize = "text-3xl lg:text-4xl";
      imageSize = "w-full aspect-video";
      gap = "2";
      break;
  }

  switch (p) {
    case "right":
      gridStyle = "flex-row-reverse items-center";
      break;
    case "left":
      gridStyle = "flex-row items-center";
      break;
    case "bottom":
      gridStyle = "flex-col-reverse";
      break;
    default:
      gridStyle = "flex-col";
      imageSize = "w-full";
      break;
  }

  imageSize = p == "top" ? "w-full" : imageSize;
</script>

<a href={report.path} class="flex {gridStyle} gap-3">
  {#if report.meta.thumb}
    <div>
      <img src={report.meta.thumb} alt={report.meta.title} class="{imageSize} max-h-96 object-cover rounded-sm" />
    </div>
  {/if}
  <div class="flex flex-1 flex-col gap-{gap}">
    <div>
      <span class="font-sans text-xs opacity-70 {new Date(report.meta.date) > limitDate ? "font-bold px-1 y-2 bg-[#B91646] text-white rounded-sm" : ""}">{new Date(report.meta.date).toLocaleDateString()}</span>
    </div>
    <h2 class="{fontSize} inline-flex items-center gap-4">
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
