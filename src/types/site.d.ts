import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
import type { HTMLAttributes, ImageMetadata } from 'astro/types'

export interface Post {
  id: string
  slug: string
  permalink: string
  publishDate: Date
  updateDate?: Date
  title: string
  excerpt?: string
  image?: ImageMetadata | string
  category?: string
  tags?: string[]
  metadata?: MetadataConfig
  draft?: boolean
  Content?: AstroComponentFactory
  content?: string
  readingTime?: number
}

export interface BasicCollection {
  id: string
  slug: string
  permalink?: string

  title: string
  description?: string
  image?: ImageMetadata | string
  metadata?: MetadataConfig

  Content?: AstroComponentFactory
  content?: string
}

export interface Tag extends BasicCollection {}
export interface Category extends BasicCollection {}

export interface Project extends BasicCollection {
  image: any
  githubUrl?: string
  liveUrl?: string
  startDate: Date
  deployDate?: Date
  modifiedDate?: Date
  stack: { icon: string; text: string }[]
}

export interface SiteConfig {
  name: string
  site: string
  base: string
  googleSiteVerificationId?: string
}

export interface MetadataConfig {
  title?:
    | {
        default: string
        template: string
      }
    | string

  description?: string
  canonical?: string
  ignoreTitleTemplate?: boolean

  robots?: {
    index?: boolean
    follow?: boolean
  }

  openGraph?: {
    url?: string
    siteName?: string
    locale?: string
    type?: string
    images?: {
      url: string
      width?: number
      height?: number
    }[]
  }

  twitter?: {
    handle?: string
    site?: string
    cardType?: string
  }
}

export interface I18NConfig {
  language: string
  textDirection: string
  dateFormatter: Intl.DateTimeFormat
}

export interface BlogConfig {
  postsPerPage: number
  relatedPostsCount: number
  permalink: string
  path: string
  categoryPath: string
  tagPath: string
}

export interface AnalyticsConfig {
  vendors: {
    googleAnalytics: {
      id?: string
      partytown?: boolean
    }
  }
}

export interface Config {
  site: SiteConfig
  metadata: MetadataConfig
  i18n: I18NConfig
  blog: BlogConfig
  analytics: AnalyticsConfig
}

/** Components */

export interface SectionProps {
  id?: string
  as?: any
  isDark?: boolean
  class?: string
}

export interface HeadlineProps {
  title?: string
  subtitle?: string
  tagline?: string
  classes?: {
    container?: string
    section?: string
    headline?: {
      container?: string
      tagline?: string
      title?: string
      subtitle?: string
    }
  }
}

export interface HeadlinedSectionProps extends SectionProps, HeadlineProps {}

export interface ContentContainerProps extends HeadlinedSectionProps {
  image?: string | unknown
  classes?: {
    container?: string
    headline?: {
      container?: string
      title?: string
      subtitle?: string
    }
    items?: {
      container?: string
      panel?: string
      title?: string
      description?: string
      icon?: string
      action?: string
    }
  }
}

export interface FeatureContainerProps extends ContentContainerProps {}

export interface Steps extends FeatureContainerProps {
  items: StepItem[]
  action?: string | Action
  image?: string | Image
  isReversed?: boolean
}

export interface Item {
  title?: string
  description?: string
  icon?: string
  callToAction?: Action
  image?: Image
  classes?: ItemClasses
}

export interface ItemClasses {
  container?: string
  panel?: string
  title?: string
  description?: string
  icon?: string
}

export interface StepItem extends Item {}

export interface Action extends HTMLAttributes<any> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link'
  text?: string
  icon?: string
  classes?: Record<string, string>
  type?: 'button' | 'submit' | 'reset'
}

export interface Image {
  src: string
  alt?: string
}

export interface GridItem {
  defaultIcon: string
  item: Item
  classes?: ItemClasses
}
