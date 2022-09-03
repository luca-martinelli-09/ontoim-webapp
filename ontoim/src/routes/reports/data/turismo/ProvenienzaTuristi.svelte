<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>

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
    } group by ?Anno ?ISO ?Nazionalità
    having (sum(?Totale) > 200)
    order by ?Anno desc(?Totale)
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

      years = [...new Set(data.map((el) => el.Anno))];
      selectedYear = years.at(-1);
    },
    error: (_) => (status = ERROR),
  });
</script>

<Status {status} />

{#if years}
  <Selector name="year-turisti-prov" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
{/if}

{#if data}
  <Graph
    option={{
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 5,
          },
          data: data
            .filter((el) => el.Anno == selectedYear)
            .map((el) => {
              return {
                name: el["Nazionalità"],
                value: el.Totale,
              };
            }),
        },
      ],
    }}
  />
{/if}
