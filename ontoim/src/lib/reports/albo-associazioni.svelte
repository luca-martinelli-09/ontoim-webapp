---
title: Albo delle associazioni
date: 2022-08-31
keywords:
  - associazioni
---

<script>
  import { querySPARQL } from '$lib/utils'

  function handleClick() {
    querySPARQL({
      query: "select * where {?s ?p ?o} limit 10",
      success: (res) => console.log(res),
      error: (res) => console.log(res)
    })
  }
</script> 

In questa sezione è possibile consultare l'albo delle associazioni del Comune di Sona, con le relative informazioni.

<table>
  <tr>
    <td>Test</td>
    <td>Test</td>
  </tr>
    <tr>
    <td>Test</td>
    <td>Test</td>
  </tr>
</table>