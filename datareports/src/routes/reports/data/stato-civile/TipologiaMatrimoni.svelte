<script>
  import { querySPARQL, sparqlToArray, groupBy, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import * as echarts from "echarts";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix civilstatuscategories: <https://w3id.org/ontoim/controlled-vocabulary/civil-status-categories/>

    select ?Anno ?Categoria ?Totale where {
        values ?category {
            civilstatuscategories:E.1
            civilstatuscategories:E.2
        }
        ?civilStatus a ontoim:CivilStatus ;
                    tiapit:hasTemporalEntity ?ti ;
                    ontoim:observationValue ?Totale ;
                    ontoim:hasCivilStatusCategory ?category .
        ?ti tiapit:year ?Anno .
        
        bind(if(?category = civilstatuscategories:E.1, "Matrimoni religiosi", "Matrimoni civili") as ?Categoria)
    } order by ?Anno desc(?Totale)
  `;

  const categoryColor = { "Matrimoni religiosi": "#80FFA5", "Matrimoni civili": "#FFBF00" };
  const categoryGradient = {
    "Matrimoni religiosi": new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(128, 255, 165)",
      },
      {
        offset: 1,
        color: "rgb(1, 191, 236)",
      },
    ]),
    "Matrimoni civili": new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(255, 191, 0)",
      },
      {
        offset: 1,
        color: "rgb(224, 62, 76)",
      },
    ]),
  };

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
        data: [...new Set(data.map((el) => el["Categoria"]))],
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
        },
      ],
      series: Object.keys(groupBy(data, "Categoria")).map((category) => {
        const categoryData = groupBy(data, "Categoria")[category];
        return {
          name: category,
          type: "line",
          smooth: true,
          lineStyle: {
            width: 0,
          },
          itemStyle: {
            color: categoryColor[category],
          },
          showSymbol: false,
          areaStyle: {
            color: categoryGradient[category],
          },
          emphasis: {
            focus: "series",
          },
          data: categoryData.map((el) => el.Totale),
        };
      }),
    }}
  />
{/if}
