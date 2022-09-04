<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import SearchableTable from "$lib/components/data/SearchableTable.svelte";
  import Status from "$lib/components/Status.svelte";

  const query = `
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix l0: <https://w3id.org/italia/onto/l0/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix xsd: <http://www.w3.org/2001/XMLSchema#>

    select ?Indirizzo ?DUG ?DUF ?Numero__Civico ?Esponente ?Località ?Città ?Provincia ?AcronimoProvincia ?lat ?long where {
        ?address a clvapit:Address ;
                skos:inScheme anncsu: ;
                clvapit:postCode ?CAP ;
                clvapit:hasStreetToponym ?street ;
                clvapit:hasAddressArea ?locality ;
                clvapit:hasCity ?city ;
                clvapit:hasProvince ?province .
        ?street clvapit:toponymQualifier ?DUG ;
                clvapit:officialStreetName ?DUF .
        ?locality l0:name ?Località .
        ?city l0:name ?Città .
        ?province l0:name ?Provincia ;
                  clvapit:acronym ?AcronimoProvincia .
        filter (lang(?Provincia) = "it") .
        optional {
            ?address clvapit:hasNumber ?civicNumber .
            ?civicNumber clvapit:streetNumber ?Numero__Civico .
            optional {
                ?civicNumber clvapit:exponent ?Esponente 
            }
        }
        optional {
            ?address clvapit:hasGeometry ?geo .
            ?geo clvapit:lat ?lat ;
                clvapit:long ?long .
        }
        bind(
            concat(?DUG, " ", ?DUF, ", ",
                coalesce(xsd:string(?Numero__Civico), "SNC"),
                coalesce(?Esponente, ""), " - ",
                xsd:string(?CAP), ", ", ?Località, " (", ?AcronimoProvincia, ")"
            ) as ?Indirizzo)
    } order by str(?DUF) ?Numero__Civico
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
  <SearchableTable
    headers={["Indirizzo"]}
    {data}
    customActionIcon="ion:location-outline"
    customAction={(el) => {
      if (el.lat) {
        window.open(`https://www.google.com/maps/place/${el.lat},${el.long}`, "_blank").focus();
      } else {
        window.open(`https://www.google.com/maps/place/${el.Indirizzo}`, "_blank").focus();
      }
    }}
  />
{/if}
