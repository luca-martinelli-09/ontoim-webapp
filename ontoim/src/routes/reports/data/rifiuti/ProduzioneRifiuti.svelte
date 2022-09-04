<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix muapit: <https://w3id.org/italia/onto/MU/>
    prefix waste: <https://w3id.org/sona/data/waste/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>

    select ?Anno ?Categoria ?Totale where {
        ?rif a ontoim:WasteProduction ;
            ontoim:hasWasteCategory ?wC ;
            tiapit:hasTemporalEntity ?ti ;
            muapit:hasValue ?value .
        ?value muapit:value ?Totale ;
              muapit:hasMeasurementUnit waste:mu\\/tons .
        ?ti tiapit:year ?Anno .
        ?wC skos:prefLabel ?Categoria .
        filter (lang(?Categoria) = "it")
    } order by ?Anno desc(?Totale)
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
  <Selector name="year-rifiuti-prod" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
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
