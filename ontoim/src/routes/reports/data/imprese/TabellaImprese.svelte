<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import SearchableTable from "$lib/components/data/SearchableTable.svelte";
  import DetailsModal from "$lib/components/DetailsModal.svelte";
  import Status from "$lib/components/Status.svelte";
  import IconedSpan from "$lib/components/IconedSpan.svelte";

  const query = `
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix smapit: <https://w3id.org/italia/onto/SM/>
    select distinct
    ?Denominazione ?Partita__IVA ?Sede ?StatoLegale
    (group_concat(distinct ?SedeUL;
            separator=";") as ?SedeUL)
    (group_concat(distinct ?pec;
            separator=",") as ?pecs)
    (group_concat(distinct ?Ateco;
            separator=",") as ?Ateco) 
    (group_concat(distinct ?AtecoDesc;
            separator=";;") as ?AtecoDesc) where {
        ?organization a/rdfs:subClassOf* ontoim:PrivateOrganization ;
                      covapit:VATnumber ?Partita__IVA ;
                      covapit:legalName ?Denominazione .
        optional {
            ?organization clvapit:hasPrimaryAddress ?address .
            ?address dc:title ?Sede .
        }
        optional {
            ?organization ontoim:hasLocalUnitAddress ?ulAddress .
            ?ulAddress dc:title ?SedeUL .
        }
        optional {
            ?organization smapit:hasOnlineContactPoint ?ocp .
            optional {
                ?ocp smapit:hasCertifiedEmail ?certMail .
                ?certMail dc:title ?pec .
            }
        }
        optional {
            ?organization covapit:hasPrivateOrgActivityType ?actType .
            ?actType skos:prefLabel ?AtecoDesc ;
                    skos:notation ?Ateco .
            filter (lang(?AtecoDesc) = "it") .
        }
        optional {
            ?organization covapit:hasLegalStatus ?legalStatus .
            ?legalStatus skos:prefLabel ?StatoLegale .
            filter (lang(?StatoLegale) = "it") .
        }
        filter not exists {
            ?organization a ontoim:Association 
        }
    }
    group by ?Denominazione ?Partita__IVA ?Sede ?StatoLegale
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
  <SearchableTable headers={["Denominazione", "Partita__IVA", "Sede"]} {data} openModal={(ref) => (modalData = ref)} />
{/if}

{#if modalData}
  <DetailsModal close={() => (modalData = null)} title={modalData.Denominazione}>
    <div class="font-sans">
      <p class="mb-5">{modalData.StatoLegale}</p>
      <IconedSpan icon="ion:finger-print-outline">{modalData.Partita__IVA}</IconedSpan>
      {#if modalData.Sede}
        <IconedSpan icon="ion:location-outline">{modalData.Sede}</IconedSpan>
      {/if}
      {#if modalData.SedeUL}
        <h4 class="font-bold">Unità Locali</h4>
        {#each modalData.SedeUL?.split(";") || [] as ul}
          <IconedSpan icon="ion:location-outline">{ul}</IconedSpan>
        {/each}
      {/if}
      {#if modalData.pecs}
        <h4 class="font-bold">Contatti</h4>
        {#each modalData.pecs?.split(",") || [] as pec}
          <IconedSpan icon="ion:shield-checkmark-outline"><a class="underline" href="mailto:{pec}">{pec}</a></IconedSpan>
        {/each}
      {/if}
      {#if modalData.AtecoDesc}
        <h4 class="font-bold">Attività</h4>
        <div class="flex flex-col gap-2">
          {#each modalData.AtecoDesc?.split(";;") || [] as AtecoDesc}
            <span>{AtecoDesc}</span>
          {/each}
        </div>
      {/if}
      {#if modalData.Ateco}
        <h4 class="font-bold">Codici ateco</h4>
        <div class="flex gap-4">
          {#each modalData.Ateco?.split(",") || [] as Ateco}
            <span>{Ateco}</span>
          {/each}
        </div>
      {/if}
    </div>
  </DetailsModal>
{/if}
