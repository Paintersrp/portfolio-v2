import { getCollection } from 'astro:content'

import { BLOG } from '@/config'
import { fetchPosts } from '@/utils/post'
import { CATEGORY_PATH } from '@/utils/paths'

import type { PaginateFunction } from 'astro'
import type { CollectionEntry } from 'astro:content'
import type { Category } from '@/types/site'

let _categories: Category[]

export const fetchCategories = async (): Promise<Category[]> => {
  if (!_categories) {
    _categories = await load()
  }

  return _categories
}

const load = async function(): Promise<Category[]> {
  const categories = await getCollection('category')
  const normalizedCategories = categories.map(
    async (category) => await getNormalizedCategory(category)
  )

  const results = await Promise.all(normalizedCategories)

  return results
}

const getNormalizedCategory = async (category: CollectionEntry<'category'>): Promise<Category> => {
  const { id, slug = '', data } = category

  const { Content } = await category.render()
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

export const findCategoriesBySlugs = async (slugs: string[]): Promise<Category[]> => {
  if (!Array.isArray(slugs)) return []

  const categories = await fetchCategories()

  return slugs.reduce(function(array: Category[], slug: string) {
    categories.some(function(category: Category) {
      return slug === category.slug && array.push(category)
    })

    return array
  }, [])
}

export const findCategoriesByIds = async (ids: string[]): Promise<Category[]> => {
  if (!Array.isArray(ids)) return []

  const categories = await fetchCategories()

  return ids.reduce(function(array: Category[], id: string) {
    categories.some(function(category: Category) {
      return id === category.id && array.push(category)
    })

    return array
  }, [])
}

export const getStaticPathsCategories = async () => {
  return (await fetchCategories()).flatMap((category) => ({
    props: { category },
  }))
}

export const getCategories = async () => {
  return await fetchCategories()
}

export const getStaticPathsCategoryPosts = async ({ paginate }: { paginate: PaginateFunction }) => {
  const posts = await fetchPosts()
  const categories = await fetchCategories()

  return Array.from(categories).flatMap((category) =>
    paginate(
      posts.filter(
        (post) => typeof post.category === 'string' && category.slug === post.category.toLowerCase()
      ),
      {
        params: { category: category.slug, blog: CATEGORY_PATH || undefined },
        pageSize: BLOG?.postsPerPage * 2,
        props: { category },
      }
    )
  )
}
