<script>
  import { querySPARQL, sparqlToArray, ERROR, LOADING, SUCCESS } from "$lib/utils";

  import Status from "$lib/components/Status.svelte";
  import Selector from "$lib/components/Selector.svelte";
  import Table from "$lib/components/data/Table.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix sex: <https://w3id.org/italia/controlled-vocabulary/classifications-for-people/sex/>

    select ?Nome (sum(?Maschi) as ?Maschi) (sum(?Femmine) as ?Femmine) (sum(?Totale) as ?Totale) where {
        {
            select ?Nome ?Maschi where {
                ?namesAndSurnames a ontoim:Citizens ;
                                  ontoim:hasDemographicReference ?df ;
                                  ontoim:observationValue ?Maschi .
                ?df cpvapit:givenName ?Nome ;
                    cpvapit:hasSex sex:M .
            } order by desc(?Maschi) limit 10
        } union {
            select ?Nome ?Femmine where {
                ?namesAndSurnames a ontoim:Citizens ;
                                  ontoim:hasDemographicReference ?df ;
                                  ontoim:observationValue ?Femmine .
                ?df cpvapit:givenName ?Nome ;
                    cpvapit:hasSex sex:F .
            } order by desc(?Femmine) limit 10
        }
        bind ((coalesce(?Maschi, 0) + coalesce(?Femmine, 0)) as ?Totale)
    } group by ?Nome
    order by desc(?Totale)
  `;

  let status = LOADING;

  let data;

  let sexType = "Totale";

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

<Selector name="sex-dem-names" options={["Maschi", "Femmine", "Totale"]} defaultSelection="Totale" onSelect={(sex) => (sexType = sex)} />

{#if data}
  <Table headers={["Nome", sexType]} data={data.filter((el) => el.Nome && el[sexType])} />
{/if}
