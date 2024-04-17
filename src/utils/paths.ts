import { BLOG, SITE } from '@/config'

export const HOME_PATH = SITE.base || '/'
export const BLOG_PATH = HOME_PATH + BLOG.path
export const POST_PERMALINK_PATTERN = BLOG.permalink

export const joinPaths = (...strings: string[]) => [...strings].join('/')

export const CATEGORY_PATH = joinPaths(BLOG_PATH, BLOG.categoryPath)
export const TAG_PATH = joinPaths(BLOG_PATH, BLOG.tagPath)

export const trimSlash = (s: string | undefined) => (s ? s.replace(/^\/+/, '') : '')
export const getLink = (path: string) => '/' + trimSlash(path)
export const getCategoryLink = (path: string) => joinPaths(CATEGORY_PATH, path)
export const getTagLink = (path: string) => joinPaths(TAG_PATH, path)

export const getCanonicalUrl = (path = ''): string | URL => {
  const url = String(new URL(path, SITE.site))

  const needsSlice = path && url.endsWith('/')

  if (needsSlice) {
    return url.slice(0, -1)
  }

  return url
}

export const getAsset = (path: string): string =>
  '/' +
  [HOME_PATH, path]
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/')
