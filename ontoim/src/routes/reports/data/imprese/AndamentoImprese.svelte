<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import * as echarts from "echarts";

  const query = `
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select ?Anno (sum(?Imprese) as ?Totale) where {
        {
            select ?Anno where {
                ?organization a/rdfs:subClassOf* ontoim:PrivateOrganization ;
                              covapit:startingActivityDate ?date .
                filter not exists {
                    ?organization a ontoim:Association 
                }
                filter not exists {
                    ?organization ontoim:bankruptcyDate|ontoim:liquidationDate|ontoim:endActivityDate ?closeDate . 
                }
                bind (year(?date) as ?Anno)
            } group by ?Anno
        }
        {
            select ?Anno1 (count(distinct ?organization) as ?Imprese) where {
                ?organization a/rdfs:subClassOf* ontoim:PrivateOrganization ;
                              covapit:startingActivityDate ?date .
                filter not exists {
                    ?organization a ontoim:Association 
                }
                filter not exists {
                    ?organization ontoim:bankruptcyDate|ontoim:liquidationDate|ontoim:endActivityDate ?closeDate . 
                }
                bind (year(?date) as ?Anno1)
            } group by ?Anno1
        }
        filter (?Anno1 <= ?Anno)
    } group by ?Anno
    order by ?Anno
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
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: data.map((el) => el.Anno),
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "Imprese",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: data.map((el) => el.Totale),
          lineStyle: {
            width: 0,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(0, 221, 255)",
              },
              {
                offset: 1,
                color: "rgb(77, 119, 255)",
              },
            ]),
          },
        },
      ],
    }}
  />
{/if}
