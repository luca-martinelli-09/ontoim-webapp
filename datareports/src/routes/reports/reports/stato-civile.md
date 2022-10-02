---
title: Stato Civile (nati, morti, matrimoni)
date: 2022-09-04
thumb: /reports/thumb-civil-status.png
keywords:
  - stato civile
---

<script>
  import AndamentoNatiMorti from "../data/stato-civile/AndamentoNatiMorti.svelte";
  import NatiMatrimonio from "../data/stato-civile/NatiMatrimonio.svelte";
  import TipologiaMatrimoni from "../data/stato-civile/TipologiaMatrimoni.svelte";
  import UnioniCivili from "../data/stato-civile/UnioniCivili.svelte";
</script>

## Nati e morti

<AndamentoNatiMorti />

### Nati da coppie sposate

<NatiMatrimonio />

## Matrimoni

### Tipologia dei matrimoni

<TipologiaMatrimoni />

### Unioni civili

<UnioniCivili />