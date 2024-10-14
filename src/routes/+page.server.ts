import type { City } from '$lib/City'
import { getJobs, getMunicipalities } from '$lib/france-travail-jobs'
import { remult } from 'remult'
import { Job } from '../shared/Job'
import type { Actions, PageServerLoad } from './$types'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad


export const actions = {
  fetchJobs: async ({ request }) => {
    const formData = await request.formData()
    const city = formData.get('city') as unknown as City
    const startDate = new Date(formData.get('startDate') as string)

    let afterDate = await getMaxJobDateByCity(city)
    if (!afterDate || startDate > afterDate) {
      afterDate = startDate
    }
    const jobs = await Array.fromAsync(getJobs(city, afterDate))

    await saveJobs(jobs)

    return {
      jobs,
    }
  },

  getMunicipalities: async () => {
    const municipalities = await getMunicipalities()
    console.log({
      municipalities: municipalities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) => ["RENNES", "BORDEAUX"].includes(m.libelle) || m.codeDepartement === "75")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.codePostal.localeCompare(b.codePostal))
    })
  },

  emptyJobs: async () => {
    // Hack to delete all jobs because Remult doesn't support it
    await remult.repo(Job).deleteMany({ where: { id: { $not: undefined } } })
  },
} satisfies Actions

async function saveJobs(jobs: Job[]) {
  await remult.repo(Job).insert(jobs)
}

async function getMaxJobDateByCity(city: City) {
  const repo = remult.repo(Job)
  const lastJob = await repo.findFirst({
    city: city,
  },
    {
      orderBy: {
        createdAt: 'desc',
      },
    })
  return lastJob?.createdAt
}

