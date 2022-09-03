---
title: Turismo
date: 2022-09-03
keywords:
  - turismo
---

<script>
  import AndamentoTuristiTotali from "../data/turismo/AndamentoTuristiTotali.svelte";
  import ProvenienzaTuristi from "../data/turismo/ProvenienzaTuristi.svelte";
  import MappaProvenienzaTuristiStranieri from "../data/turismo/MappaProvenienzaTuristiStranieri.svelte";
  import MappaProvenienzaRegioni from "../data/turismo/MappaProvenienzaRegioni.svelte";
</script>

## Presenze e arrivi negli anni

<AndamentoTuristiTotali />

## Provenienza dei turisti

Vengono considerati solo i Paesi che contribuiscono con più di 200 presenze turistiche.

<ProvenienzaTuristi />

### Mappa completa per la provenienza dei turisti stranieri

<MappaProvenienzaTuristiStranieri />

### Mappa completa per la provenienza dei turisti italiani

<MappaProvenienzaRegioni />
