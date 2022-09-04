<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";

  const query = `
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix l0: <https://w3id.org/italia/onto/l0/>

    select ?Località (count(?address) as ?Totale) where {
        ?address a clvapit:Address ;
                skos:inScheme anncsu: ;
                clvapit:hasAddressArea ?locality .
        ?locality l0:name ?Località .
    } group by ?Località
    order by desc(?Totale)
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
              name: el["Località"],
              value: el.Totale,
            };
          }),
        },
      ],
    }}
  />
{/if}
