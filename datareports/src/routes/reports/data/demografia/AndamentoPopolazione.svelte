<script>
  import { querySPARQL, sparqlToArray, groupBy, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import * as echarts from "echarts";

  const query = `
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix sex: <https://w3id.org/italia/controlled-vocabulary/classifications-for-people/sex/>
    prefix dc: <http://purl.org/dc/elements/1.1/>

    select ?Anno ?Località (sum(?Maschi) as ?Maschi) (sum(?Femmine) as ?Femmine) (sum(?Totale) as ?Totale) where {
        {
            select ?te ?spatialCoverage ?Maschi where {
                ?popM tiapit:hasTemporalEntity ?te ;
                            clvapit:hasSpatialCoverage ?spatialCoverage ;
                            ontoim:hasDemographicReference ?df ;
                            ontoim:observationValue ?Maschi .
                ?df cpvapit:hasSex sex:M .
            }
        } union {
            select ?te ?spatialCoverage ?Femmine where {
                ?popF tiapit:hasTemporalEntity ?te ;
                            clvapit:hasSpatialCoverage ?spatialCoverage ;
                            ontoim:hasDemographicReference ?df ;
                            ontoim:observationValue ?Femmine .
                ?df cpvapit:hasSex sex:F .
            }
        } .
        ?te tiapit:year ?Anno .
        ?spatialCoverage dc:title ?Località .
        
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale)
    } group by ?Anno ?Località
    order by asc(?Anno) asc(?Località)
  `;

  let status = LOADING;

  let data;

  const localitiesColors = { Lugagnano: "#80FFA5", Sona: "#00DDFF", "San Giorgio In Salici": "#FF0087", Palazzolo: "#FFBF00" };
  const localitiesGradients = {
    Lugagnano: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(128, 255, 165)",
      },
      {
        offset: 1,
        color: "rgb(1, 191, 236)",
      },
    ]),
    Sona: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(0, 221, 255)",
      },
      {
        offset: 1,
        color: "rgb(77, 119, 255)",
      },
    ]),
    "San Giorgio In Salici": new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(255, 0, 135)",
      },
      {
        offset: 1,
        color: "rgb(135, 0, 157)",
      },
    ]),
    Palazzolo: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
        data: [...new Set(data.map((el) => el["Località"]))],
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
      series: Object.keys(groupBy(data, "Località")).map((locality) => {
        const localityData = groupBy(data, "Località")[locality];
        return {
          name: locality,
          type: "line",
          stack: "Totale",
          smooth: true,
          lineStyle: {
            width: 0,
          },
          itemStyle: {
            color: localitiesColors[locality],
          },
          showSymbol: false,
          areaStyle: {
            color: localitiesGradients[locality],
          },
          emphasis: {
            focus: "series",
          },
          data: localityData.map((el) => el.Totale),
        };
      }),
    }}
  />
{/if}
