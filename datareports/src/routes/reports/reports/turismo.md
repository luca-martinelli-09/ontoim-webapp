---
title: Strutture ricettive e turismo
date: 2022-09-04
fixed: true
thumb: /reports/thumb-tourism.png
keywords:
  - turismo
---

<script>
  import AndamentoTuristiTotali from "../data/turismo/AndamentoTuristiTotali.svelte";
  import ProvenienzaTuristi from "../data/turismo/ProvenienzaTuristi.svelte";
  import MappaProvenienzaTuristiStranieri from "../data/turismo/MappaProvenienzaTuristiStranieri.svelte";
  import MappaProvenienzaRegioni from "../data/turismo/MappaProvenienzaRegioni.svelte";
  import TabellaStruttureRicettive from "../data/turismo/TabellaStruttureRicettive.svelte";
  import MappaStruttureRicettive from "../data/turismo/MappaStruttureRicettive.svelte";
</script>

## Strutture ricettive

<TabellaStruttureRicettive />

Di seguito la mappa

<MappaStruttureRicettive />

## Statistiche

### Presenze e arrivi negli anni

<AndamentoTuristiTotali />

### Provenienza dei turisti

Vengono considerati solo i Paesi che contribuiscono con più di 200 presenze turistiche.

<ProvenienzaTuristi />

#### Mappa completa per la provenienza dei turisti stranieri

<MappaProvenienzaTuristiStranieri />

#### Mappa completa per la provenienza dei turisti italiani

<MappaProvenienzaRegioni />
