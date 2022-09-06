<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix civilstatuscategories: <https://w3id.org/ontoim/controlled-vocabulary/civil-status-categories/>

    select ?Anno ?Categoria ?Totale where {
        values ?category {
            civilstatuscategories:G.1
            civilstatuscategories:G.2
        }
        ?civilStatus a ontoim:CivilStatus ;
                    tiapit:hasTemporalEntity ?ti ;
                    ontoim:observationValue ?Totale ;
                    ontoim:hasCivilStatusCategory ?category .
        ?ti tiapit:year ?Anno .
        
        bind(if(?category = civilstatuscategories:G.1, "Unioni civili tra maschi", "Unioni civili tra femmine") as ?Categoria)
    } order by ?Anno
  `;

  let status = LOADING;

  let data;
  let years;
  let selectedYear;

  querySPARQL({
    query: query,
    success: (res) => {
      data = sparqlToArray(res);
      status = SUCCESS;

      years = [...new Set(data.map((el) => el.Anno))];
      selectedYear = years.at(-1);
    },
    error: (_) => (status = ERROR),
  });
</script>

<Status {status} />

{#if years}
  <Selector name="year-sc-unioni-civili" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
{/if}

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
          data: data
            .filter((el) => el.Anno == selectedYear)
            .map((el) => {
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
