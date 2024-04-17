import { getRssString } from '@astrojs/rss'

import { SITE, METADATA } from '@/config'
import { fetchPosts } from '@/utils/blog'
import { getLink } from '@/utils/paths'

export const GET = async () => {
  const posts = await fetchPosts()

  const rss = await getRssString({
    title: `${SITE.name}’s Blog`,
    description: METADATA?.description || '',
    site: import.meta.env.SITE,
    trailingSlash: false,

    items: posts.map((post) => ({
      link: getLink(post.permalink),
      title: post.title,
      description: post.excerpt,
      pubDate: post.publishDate,
    })),
  })

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
