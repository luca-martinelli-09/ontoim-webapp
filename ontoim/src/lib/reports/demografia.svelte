---
title: Dati demografici
date: "2022-08-31"
keywords:
  - anagrafe
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

# Post

Hello, I am _Post One._

**Nice to meet you!**

<button on:click={ handleClick } >
	Load Users
</button>