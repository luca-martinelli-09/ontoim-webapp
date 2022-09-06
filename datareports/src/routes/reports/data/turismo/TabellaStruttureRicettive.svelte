<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import DetailsModal from "$lib/components/DetailsModal.svelte";
  import Status from "$lib/components/Status.svelte";
  import IconedSpan from "$lib/components/IconedSpan.svelte";

  const query = `
    prefix accoapit: <https://w3id.org/italia/onto/ACCO/>
    prefix poiapit: <https://w3id.org/italia/onto/POI/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix smapit: <https://w3id.org/italia/onto/SM/>
    prefix channel: <https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/channel/>
    prefix dc: <http://purl.org/dc/elements/1.1/>

    select ?Codice ?Denominazione ?Indirizzo
    (group_concat(distinct ?Email;
            separator=",") as ?Email)
    (group_concat(distinct ?Telefono;
            separator=",") as ?Telefono)
    (group_concat(distinct ?Fax;
            separator=",") as ?Fax)
    (group_concat(distinct ?SitoWeb;
            separator=",") as ?SitoWeb)
    ?Letti ?Camere
    (group_concat(distinct ?Servizio;
            separator=",") as ?Servizi) where {
        ?acco a accoapit:Accommodation ;
              accoapit:accommodationCode ?Codice ;
              poiapit:POIofficialName ?Denominazione ;
              clvapit:hasAddress ?address ;
              smapit:hasOnlineContactPoint ?ocp .
        ?address dc:title ?Indirizzo .
        optional {
            ?ocp smapit:hasTelephone ?fax .
            ?fax smapit:telephoneNumber ?Fax ;
                smapit:hasTelephoneType channel:033
        }
        optional {
            ?ocp smapit:hasTelephone ?tel .
            ?tel smapit:telephoneNumber ?Telefono ;
                smapit:hasTelephoneType channel:03
        }
        optional {
            ?ocp smapit:hasEmail/dc:title ?Email .
        }
        optional {
            ?ocp smapit:hasWebSite/smapit:URL ?SitoWeb .
        }
        optional {
            ?acco accoapit:totalBed ?Letti .
        }
        optional {
            ?acco accoapit:totalRoom ?Camere .
        }
        optional {
            ?acco accoapit:hasOfferedServiceDescription/accoapit:hasOSDFeature/accoapit:featureName ?Servizio .
            filter (lang(?Servizio) = "it")
        }
    } group by ?Codice ?Denominazione ?Indirizzo ?Letti ?Camere
    order by ?Denominazione
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
  <Table headers={["Denominazione", "Indirizzo"]} {data} openModal={(ref) => (modalData = ref)} />
{/if}

{#if modalData}
  <DetailsModal close={() => (modalData = null)} title={modalData.Denominazione}>
    <div class="font-sans">
      {#if modalData.Indirizzo}
        <IconedSpan icon="ion:location-outline">{modalData.Indirizzo}</IconedSpan>
      {/if}
      {#if modalData.Presidente}
        <IconedSpan icon="ion:person-outline">{modalData.Presidente}</IconedSpan>
      {/if}
      {#if modalData.Email || modalData.SitoWeb || modalData.Telefono || modalData.Fax}
        <h4 class="font-bold">Contatti</h4>
        {#each modalData.Email?.split(",") || [] as Email}
          <IconedSpan icon="ion:mail-open-outline"><a class="underline" href="mailto:{Email}">{Email}</a></IconedSpan>
        {/each}
        {#each modalData.Telefono?.split(",") || [] as Telefono}
          <IconedSpan icon="ion:call-outline"><a class="underline" href="tel:{Telefono}">{Telefono}</a></IconedSpan>
        {/each}
        {#each modalData.Fax?.split(",") || [] as Fax}
          <IconedSpan icon="ion:print-outline"><a class="underline" href="tel:{Fax}">{Fax}</a></IconedSpan>
        {/each}
        {#each modalData.SitoWeb?.split(",") || [] as SitoWeb}
          <IconedSpan icon="ion:earth-outline"><a class="underline" target="_blank" rel="noopener noreferrer" href="https://{SitoWeb}">{SitoWeb}</a></IconedSpan>
        {/each}
        {#if modalData.Letti || modalData.Camere}
          <h4 class="font-bold">Informazioni</h4>
          <div class="table">
            <div class="table-row"><strong class="table-cell pr-4">Camere</strong><span class="table-cell">{modalData.Camere}</span></div>
            <div class="table-row"><strong class="table-cell pr-4">Letti</strong><span class="table-cell">{modalData.Letti}</span></div>
          </div>
        {/if}
        {#if modalData.Servizi}
          <h4 class="font-bold">Altri servizi</h4>
          <div class="flex gap-4 flex-wrap">
            {#each modalData.Servizi?.split(",") || [] as Servizi}
              <span>{Servizi}</span>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </DetailsModal>
{/if}
