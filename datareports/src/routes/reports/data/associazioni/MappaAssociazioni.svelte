<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Status from "$lib/components/Status.svelte";
  import Map from "$lib/components/data/Map.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix roapit: <https://w3id.org/italia/onto/RO/>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix dc: <http://purl.org/dc/elements/1.1/>

    select distinct ?Denominazione ?Sede ?lat ?long where {
        ?association a ontoim:Association ;
                    covapit:legalName ?Denominazione ;
                    clvapit:hasPrimaryAddress ?address .
        ?address dc:title ?Sede ;
                clvapit:hasGeometry ?geo .
        ?geo clvapit:lat ?lat ;
            clvapit:long ?long .
        filter not exists {
            ?association ontoim:associationRemovalFromRegisterDate ?date 
        }
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
    popupTemplate={"<strong>{Denominazione}</strong><br>{Sede}"}
  />
{/if}
