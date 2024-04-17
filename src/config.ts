import type { Config } from '@/types/site'

const SITE_NAME = 'SRP'

const config: Config = {
  site: {
    name: SITE_NAME,
    site: 'https://srp.vercel.app',
    base: '/',
    googleSiteVerificationId: '',
  },

  metadata: {
    title: {
      default: `${SITE_NAME} — Portfolio`,
      template: `%s — ${SITE_NAME}`,
    },
    description: '',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: '@/assets/images/default.png', width: 1200, height: 628 }],
    },
    twitter: {
      handle: '@SRP',
      site: '@SRP',
      cardType: 'summary_large_image',
    },
  },

  i18n: {
    language: 'en',
    textDirection: 'ltr',
    dateFormatter: new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }),
  },

  blog: {
    postsPerPage: 5,
    relatedPostsCount: 4,
    permalink: '/blog/%slug%',
    path: 'blog',
    categoryPath: 'categories',
    tagPath: 'tags',
  },

  analytics: {
    vendors: {
      googleAnalytics: {
        id: undefined,
        partytown: true,
      },
    },
  },
}

export const SITE = config.site
export const METADATA = config.metadata
export const I18N = config.i18n
export const BLOG = config.blog
export const ANALYTICS = config.analytics
