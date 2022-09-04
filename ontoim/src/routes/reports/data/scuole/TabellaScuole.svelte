<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import DetailsModal from "$lib/components/DetailsModal.svelte";
  import Status from "$lib/components/Status.svelte";
  import IconedSpan from "$lib/components/IconedSpan.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix poiapit: <https://w3id.org/italia/onto/POI/>
    prefix smapit: <https://w3id.org/italia/onto/SM/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    
    select ?Categoria ?Denominazione ?Codice__MIUR ?Istituto__Comprensivo ?Tipo__Scuola ?Indirizzo
    (group_concat(distinct ?website;
            separator=",") as ?website)
    (group_concat(distinct ?email;
            separator=",") as ?email) 
    (group_concat(distinct ?pec;
            separator=",") as ?pec) where {
        values ?schoolCategory {
            ontoim:PublicSchool ontoim:PrivateSchool 
        } .
        ?school a ?schoolCategory;
                poiapit:POIofficialName ?Denominazione ;
                ontoim:schoolCode ?Codice__MIUR ;
                clvapit:hasAddress ?address ;
                ontoim:hasSchoolType ?schoolType .
        ?address dc:title ?Indirizzo .
        ?schoolType skos:prefLabel ?Tipo__Scuola .
        filter (lang(?Tipo__Scuola) = "it") .
        optional {
            ?ic ontoim:includesSchool ?school ;
                poiapit:POIofficialName ?Istituto__Comprensivo .
        }
        optional {
            ?school ontoim:ownedBy*/smapit:hasOnlineContactPoint ?ocp .
            optional {
                ?ocp smapit:hasWebSite ?ws .
                ?ws smapit:URL ?website .
            }
            optional {
                ?ocp smapit:hasEmail ?e .
                ?e dc:title ?email .
            }
            optional {
                ?ocp smapit:hasCertifiedEmail ?ce .
                ?ce dc:title ?pec .
            }
        }
        bind(if(?schoolCategory = ontoim:PublicSchool, "Scuola pubblica", "Scuola paritaria") as ?Categoria)
    } group by ?Denominazione ?Codice__MIUR ?Istituto__Comprensivo ?Categoria ?Tipo__Scuola ?Indirizzo
    order by desc(?Categoria) ?Denominazione
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
  <Table headers={["Denominazione", "Indirizzo", "Categoria", "Tipo__Scuola", "Istituto__Comprensivo"]} {data} openModal={(ref) => (modalData = ref)} />
{/if}

{#if modalData}
  <DetailsModal close={() => (modalData = null)} title={modalData.Denominazione}>
    <div class="font-sans">
      <IconedSpan icon="ion:finger-print-outline">{modalData.Codice__MIUR}</IconedSpan>
      {#if modalData.Indirizzo}
        <IconedSpan icon="ion:location-outline">{modalData.Indirizzo}</IconedSpan>
      {/if}
      {#if modalData.Presidente}
        <IconedSpan icon="ion:person-outline">{modalData.Presidente}</IconedSpan>
      {/if}
      {#if modalData.email || modalData.pec || modalData.website}
        <h4 class="font-bold">Contatti</h4>
        {#each modalData.email?.split(",") || [] as email}
          <IconedSpan icon="ion:mail-open-outline"><a class="underline" href="mailto:{email}">{email}</a></IconedSpan>
        {/each}
        {#each modalData.pec?.split(",") || [] as pec}
          <IconedSpan icon="ion:shield-checkmark-outline"><a class="underline" href="mailto:{pec}">{pec}</a></IconedSpan>
        {/each}
        {#each modalData.website?.split(",") || [] as website}
          <IconedSpan icon="ion:earth-outline"><a class="underline" target="_blank" rel="noopener noreferrer" href="https://{website}">{website}</a></IconedSpan>
        {/each}
      {/if}
    </div>
  </DetailsModal>
{/if}
