<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Graph from "$lib/components/data/Graph.svelte";
  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";

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
            civilstatuscategories:A.5
            civilstatuscategories:A.6
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
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale) .
        bind(if(?category = civilstatuscategories:A.5, "Nati nel matrimonio", "Nati fuori dal matrimonio") as ?Categoria)
    } group by ?Anno ?Categoria
    order by ?Anno ?Categoria
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
  <Selector name="year-sc-sunburst-nati" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
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
              name: el.Categoria,
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
