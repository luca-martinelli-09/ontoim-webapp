<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import Status from "$lib/components/Status.svelte";

  const query = `
    prefix municipality: <https://w3id.org/sona/data/municipality/>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix roapit: <https://w3id.org/italia/onto/RO/>
    prefix tiapit: <https://w3id.org/italia/onto/TI/>
    prefix l0: <https://w3id.org/italia/onto/l0/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>

    select ?Nome ?Ruolo ?Dal ?Al where {
        municipality:00500760236 covapit:holdEmployment ?sin .
        ?sin roapit:isRoleInTimeOf ?sindaco ;
            tiapit:hasTemporalEntity ?te ;
            roapit:withRole/l0:name ?Ruolo .
        ?sindaco cpvapit:givenName ?name ;
                cpvapit:familyName ?surname .
        ?te tiapit:startTime ?Dal .
            optional {
            ?te tiapit:endTime ?Al .
        }
        bind (concat(?name, " ", ?surname) as ?Nome)
        filter (lang(?Ruolo) = "it")
    } order by ?Dal
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
  <Table headers={["Nome", "Ruolo", "Dal", "Al"]} {data} />
{/if}
