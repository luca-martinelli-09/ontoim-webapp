<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix xsd: <http://www.w3.org/2001/XMLSchema#>

    select ?IDFascia ?FasciaDipendenti (count(distinct ?org) as ?Totale) where {
        values ?groupSize { 50 }
        
        ?org a/rdfs:subClassOf* ontoim:PrivateOrganization ;
                              ontoim:hasEmployees ?employees .
        ?employees ontoim:observationValue ?numEmployees .
        
        bind(xsd:int(?numEmployees / ?groupSize) * ?groupSize as ?IDFascia)
        bind(concat(xsd:string(?IDFascia), "-", xsd:string(?IDFascia + ?groupSize)) as ?FasciaDipendenti)
    } group by ?IDFascia ?FasciaDipendenti
    order by ?IDFascia
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
          roseType: 'area',
          radius: ["40%", "70%"],
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 5,
          },
          data: data.map((el) => {
            return {
              name: el.FasciaDipendenti,
              value: el.Totale,
            };
          }),
        },
      ],
    }}
  />
{/if}
