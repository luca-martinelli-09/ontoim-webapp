<script>
  import { querySPARQL, sparqlToArray, groupBy, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import * as echarts from "echarts";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix dc: <http://purl.org/dc/elements/1.1/>

    select ?Anno ?Categoria ?Totale where {
        ?tourists a ontoim:Tourists ;
                  ontoim:hasTouristType ?touristType ;
                  ontoim:observationValue ?Totale ;
                  tiapit:hasTemporalEntity ?ti .
        ?ti tiapit:year ?Anno .
        bind(if(?touristType = ontoim:Arrival, "Arrivi", "Presenze") as ?Categoria)
        filter not exists { ?tourists ontoim:hasDemographicReference ?df }
    } order by ?Anno desc(?Categoria)
  `;

  let status = LOADING;

  let data;

  const categoryColor = { Arrivi: "#80FFA5", Presenze: "#FFBF00" };
  const categoryGradient = {
    Arrivi: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(128, 255, 165)",
      },
      {
        offset: 1,
        color: "rgb(1, 191, 236)",
      },
    ]),
    Presenze: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
          min: function (value) {
            return value.min - ((value.max - value.min) * 20) / 100;
          },
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
