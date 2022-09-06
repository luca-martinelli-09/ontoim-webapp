<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Status from "$lib/components/Status.svelte";
  import Map from "$lib/components/data/Map.svelte";

  const query = `
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    select distinct ?Denominazione ?Sede ?SedeInfo ?lat ?long where {
        values ?prop {
            clvapit:hasPrimaryAddress ontoim:hasLocalUnitAddress
        }
        ?organization a/rdfs:subClassOf* ontoim:PrivateOrganization ;
                      ?prop ?address ;
                      covapit:VATnumber ?Partita_IVA ;
                      covapit:legalName ?Denominazione .
        ?address dc:title ?Sede ;
                clvapit:hasGeometry ?addressGeometry .
        ?addressGeometry clvapit:lat ?lat ;
                        clvapit:long ?long .
        filter not exists {
            ?organization a ontoim:Association 
        }
        bind(if(?prop = clvapit:hasPrimaryAddress, "", "Unità Locale") as ?SedeInfo)
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
    popupTemplate={"<strong>{Denominazione}</strong><br>{Sede}<br><i>{SedeInfo}</i>"}
  />
{/if}
