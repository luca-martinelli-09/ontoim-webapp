async function querySPARQL(options) {
  try {
    const res = await axios({
      method: "get",
      url: "/sparql?" + new URLSearchParams({ q: options.query }).toString()
    });

    if (options.success) {
      options.success(options.raw ? res.data : res.data.results.bindings)
    }
  } catch (err) {
    if (options.error) {
      options.error(err)
    }
  }
}