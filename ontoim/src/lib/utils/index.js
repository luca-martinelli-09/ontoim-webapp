export const fetchReports = async () => {
  const allPostFiles = import.meta.glob('../../routes/reports/reports/*.md')
  const iterablePostFiles = Object.entries(allPostFiles)

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      const { metadata } = await resolver()
      const postPath = path.slice(21, -3)

      return {
        meta: {
          thumb: "/thumb.png",
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

export const sparqlToArray = (sparqlResults) => {
  const array = []

  for (const result of sparqlResults) {
    const newRes = {}
    for (const k of Object.keys(result)) {
      newRes[k] = result[k].value.trim() != "" ? result[k].value : null;
    }
    array.push(newRes)
  }

  return array;
}

export const resolveTemplate = (template, data) => {
  return template.replace(/\{([^\{\}]*)\}/g, (_, k) => data[k]);
}

export const groupBy = (array, key) => {
  return array.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export const ERROR = 1;
export const LOADING = 2;
export const SUCCESS = 3;