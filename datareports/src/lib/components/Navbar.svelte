<script>
  import Icon from "@iconify/svelte";

  const openDataUrl = import.meta.env.VITE_OPEN_DATA_URL;
</script>

<nav class="bg-background-light border-b-2 border-black py-3 px-3 text-sm font-sans font-semibold">
  <ul class="justify-center max-w-screen-lg mx-auto flex space-x-8">
    <li><a href="/">Home</a></li>
    <li><a href="/reports">Tutti i report</a></li>
    <li><a href="/about">Informazioni</a></li>
    <li class="flex-1 hidden md:block"></li>
    <li class="hidden md:block">
      <a href={openDataUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1">
        <span>Open Data</span><Icon icon="ion:open-outline" />
      </a>
    </li>
  </ul>
</nav>
