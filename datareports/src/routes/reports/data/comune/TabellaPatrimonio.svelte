<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import DetailsModal from "$lib/components/DetailsModal.svelte";
  import Status from "$lib/components/Status.svelte";
  import IconedSpan from "$lib/components/IconedSpan.svelte";

  const query = `
    prefix municipality: <https://w3id.org/sona/data/municipality/>
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix poiapit: <https://w3id.org/italia/onto/POI/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix covapit: <https://w3id.org/italia/onto/COV/>

    select ?Categoria ?Denominazione ?Indirizzo (group_concat(?DatiCatastali;
            separator=";") as ?DatiCatastali) (group_concat(distinct ?CategoriaCatastale;
            separator=";;") as ?CategoriaCatastale) (group_concat(distinct ?Beneficiario;
            separator=";;") as ?Concessione) where {
        municipality:00500760236 ontoim:hasHeritage ?heritage .
        ?heritage ontoim:hasHeritageType/skos:prefLabel ?Categoria ;
                                        ontoim:hasFacility ?facility .
        ?facility poiapit:POIofficialName ?Denominazione .
        optional {
            ?facility clvapit:hasAddress/dc:title ?Indirizzo 
        }
        optional {
            ?facility ontoim:hasCadastralData ?cadastralData .
            optional {
                ?cadastralData ontoim:sheet ?Foglio .
            }
            optional {
                ?cadastralData ontoim:map ?Mappale .
            }
            optional {
                ?cadastralData ontoim:subordinate ?Subalterno .
            }
            optional {
                ?cadastralData ontoim:hasCadastralCategory/skos:prefLabel ?CategoriaCatastale .
            }
        }
        optional {
            ?facility ontoim:concessedWithAct ?concessionAct .
            ?concessionAct ontoim:hasBeneficiary/covapit:legalName ?Beneficiario .
        }
        bind(concat(coalesce(?Foglio, ""), ",", coalesce(?Mappale, ""), ",", coalesce(?Subalterno, "")) as ?DatiCatastali)
        filter (lang(?Categoria) = "it")
    } group by ?Categoria ?Denominazione ?Indirizzo
    order by ?Categoria
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
  <Table headers={["Denominazione", "Indirizzo", "Categoria"]} {data} openModal={(ref) => (modalData = ref)} />
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
      {#if modalData.CategoriaCatastale}
        <h4 class="font-bold">Categoria catastale</h4>
        <div class="flex flex-col gap-2">
          {#each modalData.CategoriaCatastale?.split(";;") || [] as CategoriaCatastale}
            <span>{CategoriaCatastale}</span>
          {/each}
        </div>
      {/if}
      {#if modalData.DatiCatastali != ",,"}
        <h4 class="font-bold">Dati catastali</h4>
        <Table
          headers={["Foglio", "Mappale", "Subalterno"]}
          showFoot={false}
          data={modalData.DatiCatastali?.split(";").map((dc) => {
            dc = dc.split(",");
            return {
              Foglio: dc[0],
              Mappale: dc[1],
              Subalterno: dc[2],
            };
          }, [])}
        />
      {/if}
      {#if modalData.Concessione}
        <h4 class="font-bold">In concessione a</h4>
        <div class="flex flex-col gap-2">
          {#each modalData.Concessione?.split(";;") || [] as Concessione}
            <span>{Concessione}</span>
          {/each}
        </div>
      {/if}
    </div>
  </DetailsModal>
{/if}
