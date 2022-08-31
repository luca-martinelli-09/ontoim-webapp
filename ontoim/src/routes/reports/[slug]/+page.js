export async function load({ params }) {
  const post = await import(`/src/lib/reports/${params.slug}.svelte`)
  const meta = {
    thumb: '/thumb.png',
    ...post.metadata
  }
  const content = post.default

  return {
    content,
    meta
  }
}