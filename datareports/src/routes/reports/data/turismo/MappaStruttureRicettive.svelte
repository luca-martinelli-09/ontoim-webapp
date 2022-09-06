<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Status from "$lib/components/Status.svelte";
  import Map from "$lib/components/data/Map.svelte";

  const query = `
    prefix accoapit: <https://w3id.org/italia/onto/ACCO/>
    prefix poiapit: <https://w3id.org/italia/onto/POI/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix dc: <http://purl.org/dc/elements/1.1/>

    select ?Codice ?Denominazione ?Indirizzo ?lat ?long where {
        ?acco a accoapit:Accommodation ;
              accoapit:accommodationCode ?Codice ;
              poiapit:POIofficialName ?Denominazione ;
              clvapit:hasAddress ?address .
        ?address dc:title ?Indirizzo ;
                clvapit:hasGeometry ?geo .
        ?geo clvapit:lat ?lat ;
            clvapit:long ?long .
    }
  `;

  let status = LOADING;
  let data;

  querySPARQL({
    query: query,
    success: (res) => {
      data = sparqlToArray(res);
      status = SUCCESS;
    },
    error: (_) => (status = ERROR),
  });
</script>

<Status {status} />

{#if data}
  <Map
    view={{
      position: [45.434018105371905, 10.832755704917604],
    }}
    {data}
    popupTemplate={"<strong>{Denominazione}</strong><br>{Indirizzo}"}
  />
{/if}
