<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix xsd: <http://www.w3.org/2001/XMLSchema#>
    prefix poiapit: <https://w3id.org/italia/onto/POI/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix sex: <https://w3id.org/italia/controlled-vocabulary/classifications-for-people/sex/>

    select ?AnnoScolastico ?Scuola (sum(?Maschi) as ?Maschi) (sum(?Femmine) as ?Femmine) (sum(?Totale) as ?Totale) where {
        {
            select distinct ?te ?school ?Maschi where {
                ?school a/rdfs:subClassOf* ontoim:School ;
                                        ontoim:hasSubscribers ?subM .
                ?subM tiapit:hasTemporalEntity ?te ;
                            ontoim:hasDemographicReference ?df ;
                            ontoim:observationValue ?Maschi .
                ?df cpvapit:hasSex sex:M .
            }
        } union {
            select distinct ?te ?school ?Femmine where {
                ?school a/rdfs:subClassOf* ontoim:School ;
                                        ontoim:hasSubscribers ?subF .
                ?subF tiapit:hasTemporalEntity ?te ;
                            ontoim:hasDemographicReference ?df ;
                            ontoim:observationValue ?Femmine .
                ?df cpvapit:hasSex sex:F .
            }
        }
        ?school poiapit:POIofficialName ?Scuola .
        ?te tiapit:startTime ?startTime ;
            tiapit:endTime ?endTime .
        bind(concat(str(year(?startTime)), "-", str(year(?endTime))) as ?AnnoScolastico)
        
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale)
    } group by ?AnnoScolastico ?Scuola
    order by ?AnnoScolastico ?Scuola
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

      years = [...new Set(data.map((el) => el.AnnoScolastico))];
      selectedYear = years.at(-1);
    },
    error: (_) => (status = ERROR),
  });
</script>

<Status {status} />

{#if years}
  <Selector name="year-scuole-sunburst-sub" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
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
          .filter((el) => el.AnnoScolastico == selectedYear)
          .map((el) => {
            return {
              name: el.Scuola,
              value: parseInt(el.Totale),
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
            r: "80%",
            itemStyle: {
              borderWidth: 5,
              borderRadius: 10,
            },
          },
          {
            r0: "80%",
            r: "85%",
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
