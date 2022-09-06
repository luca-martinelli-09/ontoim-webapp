<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import DetailsModal from "$lib/components/DetailsModal.svelte";
  import Status from "$lib/components/Status.svelte";
  import IconedSpan from "$lib/components/IconedSpan.svelte";

  const query = `
    prefix municipality: <https://w3id.org/sona/data/municipality/>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix roapit: <https://w3id.org/italia/onto/RO/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix smapit: <https://w3id.org/italia/onto/SM/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix dc: <http://purl.org/dc/elements/1.1/>

    select ?Denominazione ?Indirizzo ?Referente ?Email ?Telefono ?PEC where {
        ?office covapit:isSupportUnitOf municipality:00500760236 .
        ?office a covapit:Office ;
                covapit:legalName ?Denominazione ;
                clvapit:hasPrimaryAddress ?add ;
                smapit:hasOnlineContactPoint ?ocp ;
                covapit:holdEmployment ?ref .
        ?add dc:title ?Indirizzo .
        ?ref roapit:isRoleInTimeOf ?pref .
        ?pref cpvapit:givenName ?nomeRef ;
              cpvapit:familyName ?cognomeRef .
        optional { ?ocp smapit:hasEmail/dc:title ?Email . }
        optional { ?ocp smapit:hasTelephone/smapit:telephoneNumber ?Telefono }
        optional { ?ocp smapit:hasCertifiedEmail/dc:title ?PEC }
        bind (concat(?nomeRef, " ", ?cognomeRef) as ?Referente)
    } order by ?Denominazione
  `;

  let status = LOADING;
  let data;
  let modalData;

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
  <Table headers={["Denominazione", "Indirizzo", "Referente"]} {data} openModal={(ref) => (modalData = ref)} />
{/if}

{#if modalData}
  <DetailsModal close={() => (modalData = null)} title={modalData.Denominazione}>
    <div class="font-sans">
      {#if modalData.Indirizzo}
        <IconedSpan icon="ion:location-outline">{modalData.Indirizzo}</IconedSpan>
      {/if}
      {#if modalData.Referente}
        <IconedSpan icon="ion:person-outline">{modalData.Referente}</IconedSpan>
      {/if}
      {#if modalData.Email || modalData.PEC || modalData.Telefono}
        <h4 class="font-bold">Contatti</h4>
        {#each modalData.Email?.split(",") || [] as email}
          <IconedSpan icon="ion:mail-open-outline"><a class="underline" href="mailto:{email}">{email}</a></IconedSpan>
        {/each}
        {#each modalData.PEC?.split(",") || [] as pec}
          <IconedSpan icon="ion:shield-checkmark-outline"><a class="underline" href="mailto:{pec}">{pec}</a></IconedSpan>
        {/each}
        {#each modalData.Telefono?.split(",") || [] as telefono}
          <IconedSpan icon="ion:call-outline"><a class="underline" target="_blank" rel="noopener noreferrer" href="tel:{telefono}">{telefono}</a></IconedSpan>
        {/each}
      {/if}
    </div>
  </DetailsModal>
{/if}
