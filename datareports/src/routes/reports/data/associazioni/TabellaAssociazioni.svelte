<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import DetailsModal from "$lib/components/DetailsModal.svelte";
  import Status from "$lib/components/Status.svelte";
  import IconedSpan from "$lib/components/IconedSpan.svelte";

  const query = `
    prefix ontoim: <https://w3id.org/ontoim/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix covapit: <https://w3id.org/italia/onto/COV/>
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix roapit: <https://w3id.org/italia/onto/RO/>
    prefix cpvapit: <https://w3id.org/italia/onto/CPV/>
    prefix role: <https://w3id.org/sona/data/role/>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix smapit: <https://w3id.org/italia/onto/SM/>
    
    select distinct
      (?associationName as ?Denominazione)
      (?presidentCompleteName as ?Presidente)
      (?fullAddressName as ?Sede)
      (group_concat(distinct ?email; separator=",") as ?emails)
      (group_concat(distinct ?pec; separator=",") as ?pecs)
      (group_concat(distinct ?website; separator=",") as ?websites)
      (group_concat(distinct ?accountName; separator=",") as ?socialNames)
      (group_concat(distinct ?accountURL; separator=",") as ?socialLinks)
      (group_concat(distinct ?socialNetworkName; separator=",") as ?socialTypes) where {
        ?association a ontoim:Association ;
                    covapit:legalName ?associationName .
        optional {
            ?association covapit:holdEmployment ?president .
            ?president roapit:isRoleInTimeOf ?presidentPerson ;
                      roapit:withRole role:president .
            ?presidentPerson cpvapit:familyName ?presidentSurname ;
                            cpvapit:givenName ?presidentName .
        } .
        optional {
            ?association clvapit:hasPrimaryAddress ?address .
            ?address dc:title ?fullAddressName .
        }
        optional {
            ?association smapit:hasOnlineContactPoint ?ocp .
            optional {
                ?ocp smapit:hasEmail ?mail .
                ?mail dc:title ?email .
            }
            optional {
                ?ocp smapit:hasCertifiedEmail ?certMail .
                ?certMail dc:title ?pec .
            }
            optional {
                ?ocp smapit:hasWebSite ?web .
                ?web dc:title ?website .
            }
            optional {
                ?ocp smapit:hasUserAccount ?userAcc .
                ?userAcc smapit:userAccountName ?accountName ;
                        smapit:URL ?accountURL ;
                        smapit:isAccountIssuedBy ?socialNetwork .
                ?socialNetwork smapit:socialMediaName ?socialNetworkName .
            }
        }
        filter not exists {
            ?association ontoim:associationRemovalFromRegisterDate ?date 
        }
        bind ( concat(?presidentName, " ", ?presidentSurname) as ?presidentCompleteName ).
    }
    group by ?associationName ?presidentCompleteName ?fullAddressName
    order by ?associationName
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
  <Table headers={["Denominazione", "Sede", "Presidente"]} {data} openModal={(ref) => (modalData = ref)} />
{/if}

{#if modalData}
  <DetailsModal close={() => (modalData = null)} title={modalData.Denominazione}>
    <div class="font-sans">
      {#if modalData.Sede}
        <IconedSpan icon="ion:location-outline">{modalData.Sede}</IconedSpan>
      {/if}
      {#if modalData.Presidente}
        <IconedSpan icon="ion:person-outline">{modalData.Presidente}</IconedSpan>
      {/if}
      {#if modalData.emails || modalData.pecs || modalData.websites}
        <h4 class="font-bold">Contatti</h4>
        {#each modalData.emails?.split(",") || [] as email}
          <IconedSpan icon="ion:mail-open-outline"><a class="underline" href="mailto:{email}">{email}</a></IconedSpan>
        {/each}
        {#each modalData.pecs?.split(",") || [] as pec}
          <IconedSpan icon="ion:shield-checkmark-outline"><a class="underline" href="mailto:{pec}">{pec}</a></IconedSpan>
        {/each}
        {#each modalData.websites?.split(",") || [] as website}
          <IconedSpan icon="ion:earth-outline"><a class="underline" target="_blank" rel="noopener noreferrer" href="https://{website}">{website}</a></IconedSpan>
        {/each}
      {/if}
      {#if modalData.socialLinks}
        <h4 class="font-bold">Social</h4>
        <div class="flex gap-4 flex-wrap">
          {#each modalData.socialLinks?.split(",") || [] as slink, i}
            <a class="underline" target="_blank" rel="noopener noreferrer" href={slink}>
              {modalData.socialTypes?.split(",")[i]}
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </DetailsModal>
{/if}
