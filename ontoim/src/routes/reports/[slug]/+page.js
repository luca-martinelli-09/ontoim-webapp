export async function load({ params }) {
  const post = await import(`../${params.slug}.md`)
  const meta = post.metadata
  const content = post.default

  return {
    content,
    meta
  }
}