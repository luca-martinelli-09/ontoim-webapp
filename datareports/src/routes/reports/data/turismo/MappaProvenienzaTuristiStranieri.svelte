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
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix country: <http://publications.europa.eu/resource/authority/country/>

    select ?Anno ?ISO ?Nazionalità (sum(?Totale) as ?Totale) where {
        ?tourists a ontoim:Tourists ;
                  ontoim:hasTouristType ontoim:Presence ;
                  ontoim:observationValue ?Totale ;
                  tiapit:hasTemporalEntity ?ti ;
                  ontoim:hasDemographicReference ?df .
        ?ti tiapit:year ?Anno .
        ?df cpvapit:hasCitizenship ?country .
        ?country dc:identifier ?ISO ;
                skos:prefLabel ?Nazionalità .
        filter (lang(?Nazionalità) = "it")
        filter (?country != country:ITA)
    } group by ?Anno ?ISO ?Nazionalità
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
