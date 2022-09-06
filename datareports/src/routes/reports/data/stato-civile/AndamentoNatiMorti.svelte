<script>
  import { querySPARQL, sparqlToArray, groupBy, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import * as echarts from "echarts";

  const query = `
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix civilstatuscategories: <https://w3id.org/ontoim/controlled-vocabulary/civil-status-categories/>
    prefix dct: <http://purl.org/dc/terms/>
    prefix sex: <https://w3id.org/italia/controlled-vocabulary/classifications-for-people/sex/>

    select ?Anno ?Categoria (sum(?Maschi) as ?Maschi) (sum(?Femmine) as ?Femmine) (sum(?Totale) as ?Totale) where {
        values ?category {
            civilstatuscategories:A.1
            civilstatuscategories:A.2
            civilstatuscategories:A.3
            civilstatuscategories:B.1
            civilstatuscategories:B.2
            civilstatuscategories:B.3
        }
        {
            select ?Anno ?Maschi ?category where {
                ?civilStatus a ontoim:CivilStatus ;
                            tiapit:hasTemporalEntity ?ti ;
                            ontoim:observationValue ?Maschi ;
                            ontoim:hasCivilStatusCategory ?category ;
                            ontoim:hasDemographicReference ?df .
                ?df cpvapit:hasSex sex:M .
                ?ti tiapit:year ?Anno .
            }
        } union {
            select ?Anno ?Femmine ?category where {
                ?civilStatus a ontoim:CivilStatus ;
                            tiapit:hasTemporalEntity ?ti ;
                            ontoim:observationValue ?Femmine ;
                            ontoim:hasCivilStatusCategory ?category ;
                            ontoim:hasDemographicReference ?df .
                ?df cpvapit:hasSex sex:F .
                ?ti tiapit:year ?Anno .
            }
        }
        ?category skos:broader ?migrationFlux .
        
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale)
        bind(if(?migrationFlux = civilstatuscategories:A, "Nati", "Morti") as ?Categoria)
    } group by ?Anno ?Categoria
    order by ?Anno ?Categoria
  `;

  let status = LOADING;

  let data;

  const categoriesColor = { Nati: "#80FFA5", Morti: "#FFBF00" };
  const categoriesGradient = {
    Nati: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "rgb(128, 255, 165)",
      },
      {
        offset: 1,
        color: "rgb(1, 191, 236)",
      },
    ]),
    Morti: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
        data: [
          ...new Set(
            data.reduce((l, el) => {
              for (const sex of ["Maschi", "Femmine"]) {
                (l || []).push(el.Categoria + " - " + sex);
              }
              return l;
            }, [])
          ),
        ],
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: [...new Set(data.map((el) => el.Anno))],
      },
      yAxis: {
        type: "value",
      },
      series: Object.keys(groupBy(data, "Categoria")).reduce((serie, category) => {
        const categoryData = groupBy(data, "Categoria")[category];
        for (const sex of ["Maschi", "Femmine"]) {
          (serie || []).push({
            name: category + " - " + sex,
            stack: category,
            type: "line",
            smooth: true,
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: categoriesColor[category],
            },
            showSymbol: false,
            areaStyle: {
              color: categoriesGradient[category],
            },
            emphasis: {
              focus: "series",
            },
            data: categoryData.map((el) => el[sex]),
          });
        }
        return serie;
      }, []),
    }}
  />
{/if}
