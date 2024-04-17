import { getCollection } from 'astro:content'
import { trimSlash } from '@/utils/paths'

import type { CollectionEntry } from 'astro:content'
import type { Project } from '@/types/site'

let _projects: Project[]

export const fetchProjects = async (): Promise<Project[]> => {
  if (!_projects) {
    _projects = await load()
  }

  return _projects
}

const load = async function (): Promise<Project[]> {
  const projects = await getCollection('project')
  const normalizedProjects = projects.map(async (project) => await getNormalizedProject(project))
  const results = await Promise.all(normalizedProjects)

  return results
}

const getNormalizedProject = async (project: CollectionEntry<'project'>): Promise<Project> => {
  const { id, slug = '', data } = project
  const { Content } = await project.render()

  const {
    image,
    title,
    description,
    startDate: rawStartDate = new Date(),
    deployDate: rawDeployDate,
    modifiedDate: rawModifiedDate,
    githubUrl,
    liveUrl,
    stack,
    metadata = {},
  } = data

  const startDate = new Date(rawStartDate)
  const deployDate = rawDeployDate ? new Date(rawDeployDate) : undefined
  const modifiedDate = rawModifiedDate ? new Date(rawModifiedDate) : undefined

  return {
    id,
    slug,
    permalink: await generatePermalink({ slug }),
    startDate,
    deployDate,
    modifiedDate,
    image,
    title,
    description,
    githubUrl,
    liveUrl,
    stack,
    metadata,
    Content: Content,
  }
}

const generatePermalink = async ({ slug }: { slug: string }) => {
  const permalink = 'project/%slug%'.replace('%slug%', slug)

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/')
}

export const findProjectsBySlugs = async (slugs: string[]): Promise<Project[]> => {
  if (!Array.isArray(slugs)) return []

  const projects = await fetchProjects()

  return slugs.reduce(function (array: Project[], slug: string) {
    projects.some(function (project: Project) {
      return slug === project.slug && array.push(project)
    })

    return array
  }, [])
}

export const findProjectsByIds = async (ids: string[]): Promise<Project[]> => {
  if (!Array.isArray(ids)) return []

  const projects = await fetchProjects()

  return ids.reduce(function (array: Project[], id: string) {
    projects.some(function (project: Project) {
      return id === project.id && array.push(project)
    })

    return array
  }, [])
}

export const getStaticPathsProject = async () => {
  return (await fetchProjects()).flatMap((project) => ({
    params: {
      project: project.permalink,
    },
    props: { project },
  }))
}

export const getStaticPathsProjects = async () => {
  return (await fetchProjects()).flatMap((project) => ({
    props: { project },
  }))
}
