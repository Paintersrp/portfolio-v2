import { getCollection } from 'astro:content'

import { BLOG } from '@/config'
import { fetchPosts } from '@/utils/blog'
import { TAG_PATH } from '@/utils/paths'

import type { CollectionEntry } from 'astro:content'
import type { PaginateFunction } from 'astro'
import type { Tag } from '@/types/site'

let _tags: Tag[]

export const fetchTags = async (): Promise<Tag[]> => {
  if (!_tags) {
    _tags = await load()
  }

  return _tags
}

const load = async function (): Promise<Tag[]> {
  const tags = await getCollection('tag')
  const normalizedTags = tags.map(async (tag) => await getNormalizedTag(tag))

  const results = await Promise.all(normalizedTags)

  return results
}

const getNormalizedTag = async (tag: CollectionEntry<'tag'>): Promise<Tag> => {
  const { id, slug = '', data } = tag

  const { Content } = await tag.render()
  const { title, description, image, metadata = {} } = data

  return {
    id,
    slug,
    
    title,
    description,
    image,
    metadata,
    Content: Content,
  }
}

export const findTagsBySlugs = async (slugs: string[]): Promise<Tag[]> => {
  if (!Array.isArray(slugs)) return []

  const tags = await fetchTags()

  return slugs.reduce(function (array: Tag[], slug: string) {
    tags.some(function (tag: Tag) {
      return slug === tag.slug && array.push(tag)
    })

    return array
  }, [])
}

export const findTagsByIds = async (ids: string[]): Promise<Tag[]> => {
  if (!Array.isArray(ids)) return []

  const tags = await fetchTags()

  return ids.reduce(function (array: Tag[], id: string) {
    tags.some(function (tag: Tag) {
      return id === tag.id && array.push(tag)
    })
    return array
  }, [])
}

export const getStaticPathsTags = async () => {
  return (await fetchTags()).flatMap((tag) => ({
    props: { tag },
  }))
}

export const getTags = async () => {
  return await fetchTags()
}

export const getStaticPathsTagPosts = async ({ paginate }: { paginate: PaginateFunction }) => {
  const posts = await fetchPosts()
  const tags = await fetchTags()

  return Array.from(tags).flatMap((tag) =>
    paginate(
      posts.filter(
        (post) =>
          Array.isArray(post.tags) && post.tags.find((elem) => elem.toLowerCase() === tag.slug)
      ),
      {
        params: { tag: tag.slug, blog: TAG_PATH || undefined },
        pageSize: BLOG.postsPerPage,
        props: { tag },
      }
    )
  )
}
