<script>
  import Icon from "@iconify/svelte";

  export let message;
  export let type;

  let iconName;
  let bgColor;
  switch (type) {
    case "warning":
      iconName = "ion:warning-outline";
      bgColor = "#FF5B00"
      break;
    case "error":
      iconName = "ion:alert-circle-outline";
      bgColor = "#EB1D36"
      break;
    case "success":
      iconName = "ion:checkmark-circle-outline";
      bgColor = "#59CE8F"
      break;
    default:
      iconName = "ion:information-circle-outline";
      bgColor = "#764AF1"
      break;
  }
</script>

<div style="background-color: {bgColor}" class="flex items-center gap-3 px-4 py-3 rounded-sm shadow-md font-sans text-white text-base">
  <div class="text-2xl">
    <Icon icon={iconName} />
  </div>
  {message}
</div>