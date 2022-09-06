<script>
  const paName = import.meta.env.VITE_PA_NAME;
  const paUrl = import.meta.env.VITE_PA_URL;
  const paCF = import.meta.env.VITE_PA_CF;
  const paAddress = import.meta.env.VITE_PA_ADDRESS;
  const openDataUrl = import.meta.env.VITE_OPEN_DATA_URL;
  const lodViewUrl = import.meta.env.VITE_LODVIEW_HOMEURL;
  const sparqlEndpoint = import.meta.env.VITE_SPARQL_ENDPOINT;
</script>

<footer class="bg-black text-white text-sm py-5 px-3 font-monospace mt-28">
  <div class="max-w-screen-lg mx-auto grid md:grid-cols-2">
    <p class="flex flex-col space-y-1">
      <a class="text-xl" href={paUrl} target="_blank" rel="noopener noreferrer">{paName}</a>
      <span class="text-xs">CF/P.IVA {paCF}</span>
      <span class="text-xs">{paAddress}</span>
    </p>
    <p class="flex flex-col space-y-2 text-left md:text-right border-t border-gray-600 mt-5 pt-5 md:border-0 md:mt-0 md:pt-0">
      <a href={lodViewUrl} target="_blank" rel="noopener noreferrer">LodView</a>
      <a href={openDataUrl} target="_blank" rel="noopener noreferrer">Open Data Portal</a>
      <a href={sparqlEndpoint} target="_blank" rel="noopener noreferrer">SPARQL Endpoint</a>
      <span>Realizzato da <a href="https://lucamartinelli.eu.org" target="_blank" rel="noopener noreferrer">Luca Martinelli</a></span>
    </p>
  </div>
</footer>
