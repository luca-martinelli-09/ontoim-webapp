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

    select ?Anno ?Categoria ?IDTipologia ?Tipologia (sum(?Maschi) as ?Maschi) (sum(?Femmine) as ?Femmine) (sum(?Totale) as ?Totale) where {
        values ?migrationFlux {
            civilstatuscategories:C civilstatuscategories:D 
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
        
        ?category skos:broader ?migrationFlux ;
                  dct:identifier ?IDTipologia ;
                  skos:prefLabel ?Tipologia .
        ?migrationFlux dct:identifier ?Categoria .
        
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale)
        filter(lang(?Tipologia) = "it")
    } group by ?Anno ?Categoria ?IDTipologia ?Tipologia
    order by ?Anno ?IDTipologia
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
  <Selector name="year-dem-migration-flux" options={years} defaultSelection={selectedYear} onSelect={(year) => (selectedYear = year)} />
{/if}

{#if data}
  <Graph
    option={{
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
      },
      series: {
        type: "sankey",
        layout: "none",
        emphasis: {
          focus: "adjacency",
        },
        lineStyle: {
          color: "gradient",
          curveness: 0.5,
        },
        draggable: false,
        data: ["Sona", ...new Set(data.map((el) => el.Tipologia))].map((t) => {
          return {
            name: t,
            itemStyle: {
              color: {
                Sona: "#FF7F3F",
                "Immigrazione da un altro comune": "#7FB77E",
                "Immigrazione dall'estero": "#6FEDD6",
                "Altra tipologia di immigrazione": "#F0E161",
                "Emigrazione in altro comune": "#7FB77E",
                "Emigrazione all'estero": "#6FEDD6",
                "Altra tipologia di emigrazione": "#F0E161",
              }[t],
            },
          };
        }),
        links: data
          .filter((el) => el.Anno == selectedYear)
          .map((el) => {
            return {
              source: el.Categoria == "C" ? el.Tipologia : "Sona",
              target: el.Categoria == "D" ? el.Tipologia : "Sona",
              value: el.Totale,
            };
          }),
      },
    }}
  />
{/if}
