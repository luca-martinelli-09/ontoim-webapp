<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    
    select ?Categoria ?Totale where {
        {
            select ?Categoria (count(distinct ?org) as ?Totale) where {
                ?org a/rdfs:subClassOf* ontoim:PrivateOrganization ;
                                      ontoim:hasDemographicCategory ?demoCategory .
                ?demoCategory skos:prefLabel ?Categoria .
            } group by ?Categoria
        } union {
            select ("Impresa artigiana"@it as ?Categoria) (count(distinct ?org) as ?Totale) where {
                ?org a ontoim:ArtisanOrganization .
            }
        }
        filter(lang(?Categoria) = "it")
    } order by desc(?Totale)
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
  <Graph
    option={{
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 5,
          },
          data: data.map((el) => {
            return {
              name: el.Categoria,
              value: el.Totale,
            };
          }),
        },
      ],
    }}
  />
{/if}
