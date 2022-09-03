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
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix l0: <https://w3id.org/italia/onto/l0/>

    select ?Anno ?Regione ?ISTAT (sum(?Totale) as ?Totale) where {
        ?tourists a ontoim:Tourists ;
                  ontoim:hasTouristType ontoim:Presence ;
                  ontoim:observationValue ?Totale ;
                  tiapit:hasTemporalEntity ?ti ;
                  ontoim:hasDemographicReference ?df .
        ?ti tiapit:year ?Anno .
        ?df cpvapit:residentIn ?add .
        ?add clvapit:hasRegion ?region .
        ?region l0:name ?Regione ;
                clvapit:hasIdentifier ?idRegion .
        ?idRegion l0:identifier ?ISTAT .
        filter (lang(?Regione) = "it")
    } group by ?Anno ?Regione ?ISTAT
    order by ?Anno desc(?Totale)
  `;

  let status = LOADING;

  let data;
  let years;
  let selectedYear;

  onMount(async () => {
    const italyJSON = await (await fetch("/maps/italy.geo.json")).json();
    echarts.registerMap("ITA", italyJSON);

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
  <Selector name="year-dem-region-map" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
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
          map: "ITA",
          nameProperty: "reg_istat_code",
          data: data
            .filter((el) => el.Anno == selectedYear)
            .map((el) => {
              return {
                name: el.ISTAT,
                label: {
                  formatter: el["Regione"],
                },
                value: el.Totale,
              };
            }),
        },
      ],
    }}
  />
{/if}
