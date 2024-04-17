import { getCollection } from 'astro:content'
import slugify from 'limax'
import getReadingTime from 'reading-time'

import { BLOG } from '@/config'
import {
  trimSlash,
  BLOG_PATH,
  POST_PERMALINK_PATTERN,
  CATEGORY_PATH,
  TAG_PATH,
} from '@/utils/paths'

import type { PaginateFunction } from 'astro'
import type { CollectionEntry } from 'astro:content'
import type { Post } from '@/types/site'

export const blogPostsPerPage = BLOG?.postsPerPage

let _posts: Post[]
let _counts = {
  tags: new Map(),
  categories: new Map(),
}

export const fetchPosts = async (): Promise<Post[]> => {
  if (!_posts) {
    _posts = await load()
  }

  return _posts
}

export const fetchCounts = async (): Promise<{
  tags: Map<any, any>
  categories: Map<any, any>
}> => {
  // Our counts are obtained during post collection processing, therefore if there are no posts we need to load them before we can provide counts
  if (!_posts) {
    _posts = await load()
  }

  return _counts
}

const load = async function (): Promise<Post[]> {
  const posts = await getCollection('post')
  const normalizedPosts = posts.map(async (post) => await getNormalizedPost(post))

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => !post.draft)

  return results
}

const getNormalizedPost = async (post: CollectionEntry<'post'>): Promise<Post> => {
  const { id, slug: rawSlug = '', data } = post
  const { Content } = await post.render()

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    draft = false,
    metadata = {},
  } = data

  const slug = cleanSlug(rawSlug)
  const publishDate = new Date(rawPublishDate)
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined
  const category = rawCategory ? cleanSlug(rawCategory) : undefined
  const tags = rawTags.map((tag: string) => cleanSlug(tag))

  if (category) countCategory(category)
  if (tags) countTags(tags)

  return {
    id,
    slug,
    permalink: await generatePermalink({ slug }),
    publishDate,
    updateDate,
    title,
    excerpt,
    image,
    category,
    tags,
    draft,
    metadata,
    Content,
    readingTime: Math.ceil(getReadingTime(post.body).minutes),
  }
}

const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/')

const countTags = async (tags: string[]) => {
  tags.forEach((tag) => {
    const currentCount = _counts.tags.get(tag) || 0
    _counts.tags.set(tag, currentCount + 1)
  })
}

const countCategory = async (category: string) => {
  const currentCount = _counts.categories.get(category) || 0
  _counts.categories.set(category, currentCount + 1)
}

const generatePermalink = async ({ slug }: { slug: string }) => {
  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/')
}

export const findPostsBySlugs = async (slugs: string[]): Promise<Post[]> => {
  if (!Array.isArray(slugs)) return []

  const posts = await fetchPosts()

  return slugs.reduce(function (array: Post[], slug: string) {
    posts.some(function (post: Post) {
      return slug === post.slug && array.push(post)
    })

    return array
  }, [])
}

export const findPostsByIds = async (ids: string[]): Promise<Post[]> => {
  if (!Array.isArray(ids)) return []

  const posts = await fetchPosts()

  return ids.reduce(function (array: Post[], id: string) {
    posts.some(function (post: Post) {
      return id === post.id && array.push(post)
    })
    return array
  }, [])
}

export const findLatestPosts = async ({ count }: { count?: number }): Promise<Post[]> => {
  const _count = count || 4
  const posts = await fetchPosts()

  return posts ? posts.slice(0, _count) : []
}

export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  return paginate(await fetchPosts(), {
    params: { blog: BLOG_PATH || undefined },
    pageSize: blogPostsPerPage,
  })
}

export const getStaticPathsBlogPost = async () => {
  return (await fetchPosts()).flatMap((post) => ({
    params: {
      blog: post.permalink,
    },
    props: { post },
  }))
}

export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  const posts = await fetchPosts()
  const categories = new Set<string>()
  posts.map((post) => {
    typeof post.category === 'string' && categories.add(post.category.toLowerCase())
  })

  return Array.from(categories).flatMap((category) =>
    paginate(
      posts.filter(
        (post) => typeof post.category === 'string' && category === post.category.toLowerCase()
      ),
      {
        params: { category: category, blog: CATEGORY_PATH || undefined },
        pageSize: blogPostsPerPage,
        props: { category },
      }
    )
  )
}

export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  const posts = await fetchPosts()
  const tags = new Set<string>()
  posts.map((post) => {
    Array.isArray(post.tags) && post.tags.map((tag) => tags.add(tag.toLowerCase()))
  })

  return Array.from(tags).flatMap((tag) =>
    paginate(
      posts.filter(
        (post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.toLowerCase() === tag)
      ),
      {
        params: { tag: tag, blog: TAG_PATH || undefined },
        pageSize: blogPostsPerPage,
        props: { tag },
      }
    )
  )
}

const getRandomizedPosts = (array: Post[], num: number) => {
  const newArray: Post[] = []

  while (newArray.length < num && array.length > 0) {
    const randomIndex = Math.floor(Math.random() * array.length)
    newArray.push(array[randomIndex])
    array.splice(randomIndex, 1)
  }

  return newArray
}

export function getRelatedPosts(allPosts: Post[], currentSlug: string, currentTags: string[]) {
  const relatedPosts = getRandomizedPosts(
    allPosts.filter(
      (post) => post.slug !== currentSlug && post.tags?.some((tag) => currentTags.includes(tag))
    ),
    BLOG.relatedPostsCount
  )

  if (relatedPosts.length < BLOG.relatedPostsCount) {
    const morePosts = getRandomizedPosts(
      allPosts.filter(
        (post) => post.slug !== currentSlug && !post.tags?.some((tag) => currentTags.includes(tag))
      ),
      BLOG.relatedPostsCount - relatedPosts.length
    )
    relatedPosts.push(...morePosts)
  }

  return relatedPosts
}
