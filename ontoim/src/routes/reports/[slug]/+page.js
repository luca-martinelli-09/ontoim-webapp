export async function load({ params }) {
  const post = await import(`../reports/${params.slug}.md`)
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