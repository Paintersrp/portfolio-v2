import { z, defineCollection } from 'astro:content'

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),
      canonical: z.string().url().optional(),
      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),
      description: z.string().optional(),
      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional()

const postCollection = defineCollection({
  schema: z.object({
    created: z.date(),
    published: z.date().optional(),
    updated: z.date().optional(),
    draft: z.boolean().optional(),
    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: metadataDefinition(),
  }),
})

const tagCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    metadata: metadataDefinition(),
  }),
})

const categoryCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    metadata: metadataDefinition(),
  }),
})

const projectCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    startDate: z.date().optional(),
    deployDate: z.date().optional(),
    modifiedDate: z.date().optional(),
    githubUrl: z.string(),
    liveUrl: z.string(),
    image: z.string().optional(),
    metadata: metadataDefinition(),
    stack: z.array(
      z.object({
        icon: z.string(),
        text: z.string(),
      })
    ),
  }),
})

export const collections = {
  post: postCollection,
  tag: tagCollection,
  category: categoryCollection,
  project: projectCollection,
}
