import { defineConfig } from 'astro/config'
// import compress from 'astro-compress'
import icon from 'astro-icon'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import path from 'path'
import { fileURLToPath } from 'url'

import { SITE } from './src/config'
import tasks from './src/scripts/tasks'

export default defineConfig({
  site: SITE.site,
  base: SITE.base,
  trailingSlash: 'never',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
      },
    }),
    // compress({
    //   CSS: true,
    //   HTML: {
    //     'html-minifier-terser': {
    //       removeAttributeQuotes: false,
    //     },
    //   },
    //   Image: false,
    //   JavaScript: true,
    //   SVG: false,
    // }),
    tasks(),
    react(),
  ],
  // image: {
  //   service: squooshImageService(),
  // },
  vite: {
    define: {
      'import.meta.env.PUBLIC_BASE_URL': JSON.stringify(process.env.PUBLIC_BASE_URL),
      'import.meta.env.PUBLIC_TOKEN': JSON.stringify(process.env.PUBLIC_TOKEN),
    },
    resolve: {
      alias: {
        '@/': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
      },
    },
  },
})
