<script>
  import { querySPARQL, sparqlToArray, SUCCESS, ERROR, LOADING } from "$lib/utils";
  import Table from "$lib/components/data/Table.svelte";
  import Status from "$lib/components/Status.svelte";

  const query = `
    prefix clvapit: <https://w3id.org/italia/onto/CLV/>
    prefix skos: <http://www.w3.org/2004/02/skos/core#>
    prefix anncsu: <https://w3id.org/sona/data/ANNCSU/>
    prefix l0: <https://w3id.org/italia/onto/l0/>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix xsd: <http://www.w3.org/2001/XMLSchema#>

    select distinct ?Indirizzo ?DUG ?DUF ?Località ?Città ?Provincia ?AcronimoProvincia where {
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
        bind(concat(?DUG, " ", ?DUF) as ?Indirizzo)
    } order by str(?DUF) ?NumeroCivico
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
  <Table headers={["Indirizzo", "DUG", "DUF", "Località"]} {data} />
{/if}
