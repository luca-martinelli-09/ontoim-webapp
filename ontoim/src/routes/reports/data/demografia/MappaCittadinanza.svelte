<script>
  import { onMount } from "svelte";

  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

  import * as echarts from "echarts";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix sex: <https://w3id.org/italia/controlled-vocabulary/classifications-for-people/sex/>

    select ?Anno ?Nazionalità ?ISO (sum(?Maschi) as ?Maschi) (sum(?Femmine) as ?Femmine) (sum(?Totale) as ?Totale) where {
        {
            select ?Anno ?Nazionalità ?ISO ?Maschi where {
                ?foreign a ontoim:Citizens ;
                        ontoim:hasDemographicReference ?df ;
                        tiapit:hasTemporalEntity ?ti ;
                        ontoim:observationValue ?Maschi .
                ?ti tiapit:year ?Anno .
                ?df cpvapit:hasCitizenship ?oc ;
                    cpvapit:hasSex sex:M .
                ?oc dc:identifier ?ISO ;
                    skos:prefLabel ?Nazionalità .
            }
        } union {
            select ?Anno ?Nazionalità ?ISO ?Femmine where {
                ?foreign a ontoim:Citizens ;
                        ontoim:hasDemographicReference ?df ;
                        tiapit:hasTemporalEntity ?ti ;
                        ontoim:observationValue ?Femmine .
                ?ti tiapit:year ?Anno .
                ?df cpvapit:hasCitizenship ?oc ;
                    cpvapit:hasSex sex:F .
                ?oc dc:identifier ?ISO ;
                    skos:prefLabel ?Nazionalità .
            }
        }
        
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale)
        
        filter ((lang(?Nazionalità) = "it"))
    } group by ?Anno ?Nazionalità ?ISO
    order by ?Anno desc(?Totale)
  `;

  const queryNames = `
    prefix atold: <http://publications.europa.eu/resource/authority/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    
    select distinct ?ISO ?Nazionalità where {
        ?c skos:inScheme atold:country ;
          skos:prefLabel ?Nazionalità ;
          dc:identifier ?ISO .
        filter (lang(?Nazionalità) = "it")
    }
  `;

  let status = LOADING;

  let data;
  let stateNames;
  let years;
  let selectedYear;

  onMount(async () => {
    const worldJSON = await (await fetch("/maps/world.geo.json")).json();
    echarts.registerMap("WORLD", worldJSON);

    querySPARQL({
      query: queryNames,
      success: (res) => {
        stateNames = sparqlToArray(res);
      },
    });

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
  });
</script>

<Status {status} />

{#if years}
  <Selector name="year-dem-citizenship-map" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
{/if}

{#if data}
  <Graph
    option={{
      tooltip: {
        trigger: "item",
        formatter: "{c}",
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.filter((el) => el.Anno == selectedYear).map((el) => el.Totale)),
        calculable: true,
      },
      series: [
        {
          type: "map",
          roam: true,
          map: "WORLD",
          nameProperty: "ISO_A3",
          data: Object.values(
            stateNames.reduce((sv, el) => {
              const dataVal = data.filter((d) => d.Anno == selectedYear && d.ISO == el.ISO).pop();
              (sv || {})[el.ISO] = {
                name: el.ISO,
                label: {
                  formatter: el["Nazionalità"],
                },
                value: dataVal?.Totale || 0,
                itemStyle: {
                  color: dataVal ? null : "#eee",
                },
              };
              return sv;
            }, {})
          ),
        },
      ],
    }}
  />
{/if}
