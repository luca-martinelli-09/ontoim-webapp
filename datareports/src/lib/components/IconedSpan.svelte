<script>
  import Icon from "@iconify/svelte";

  export let icon;
</script>

<div class="flex gap-3 items-center">
  <span class="text-xl">
    <Icon {icon} />
  </span>
  <slot />
</div>
