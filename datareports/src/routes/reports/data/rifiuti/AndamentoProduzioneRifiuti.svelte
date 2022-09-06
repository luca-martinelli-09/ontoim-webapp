<script>
  import { querySPARQL, sparqlToArray, groupBy, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";

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
    } order by ?Anno desc(?Categoria)
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
        trigger: "axis",
      },
      legend: {
        top: "bottom",
        data: [...new Set(data.map((el) => el.Categoria))],
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: [...new Set(data.map((el) => el.Anno))],
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Tonnellate (t)",
        },
      ],
      series: Object.keys(groupBy(data, "Categoria")).map((category) => {
        const categoryData = groupBy(data, "Categoria")[category];
        return {
          name: category,
          type: "line",
          stack: "Totale",
          smooth: true,
          showSymbol: false,
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: categoryData.map((el) => [el.Anno, el.Totale]),
        };
      }),
    }}
  />
{/if}
