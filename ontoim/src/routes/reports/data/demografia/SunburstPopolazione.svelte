<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

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
  let years;
  let selectedYear;

  const localitiesColors = { Lugagnano: "#80FFA5", Sona: "#00DDFF", "San Giorgio In Salici": "#FF0087", Palazzolo: "#FFBF00" };

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
  <Selector name="year-dem-sunburst-pop" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
{/if}

{#if data}
  <Graph
    option={{
      tooltip: {
        trigger: "item",
      },
      series: {
        type: "sunburst",
        data: data
          .filter((el) => el.Anno == selectedYear)
          .map((el) => {
            return {
              name: el["Località"],
              value: parseInt(el.Totale),
              itemStyle: {
                color: localitiesColors[el["Località"]],
              },
              children: [
                {
                  name: "Maschi",
                  value: parseInt(el.Maschi),
                  itemStyle: {
                    color: "#6173F4",
                  },
                },
                {
                  name: "Femmine",
                  value: parseInt(el.Femmine),
                  itemStyle: {
                    color: "#F66095",
                  },
                },
              ],
            };
          }),
        levels: [
          {},
          {
            r0: "10%",
            r: "75%",
            itemStyle: {
              borderWidth: 5,
              borderRadius: 10,
            },
          },
          {
            r0: "75%",
            r: "80%",
            label: {
              rotate: "tangential",
              position: "outside",
              distance: 25,
            },
            itemStyle: {
              borderWidth: 5,
              borderRadius: 7,
            },
          },
        ],
      },
    }}
  />
{/if}
