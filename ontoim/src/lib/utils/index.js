export const fetchReports = async () => {
  const allPostFiles = import.meta.glob('../reports/*.svelte')
  const iterablePostFiles = Object.entries(allPostFiles)

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      const { metadata } = await resolver()
      const postPath = path.slice(2, -7)

      return {
        meta: {
          thumb: "thumb.png",
          ...metadata
        },
        path: postPath,
      }
    })
  )

  return allPosts
}

export const querySPARQL = async (options) => {
  const urlParams = new URLSearchParams({
    infer: true,
    sameAs: true,
    format: "application/sparql-results+json",
    query: options.query,
  })

  const response = await fetch(import.meta.env.VITE_SPARQL_ENDPOINT + "?" + urlParams.toString());

  if (response.ok) {
    let res = await response.json()
    options.success(options.raw ? res : res.results.bindings)
  } else {
    if (options.error) {
      options.error(response)
    }
  }
}