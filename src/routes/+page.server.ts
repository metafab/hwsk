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

    logStats(jobs)

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
    const deletedCount = await remult.repo(Job).deleteMany({ where: { id: { $ne: "xxxxxx" } } })
    return {
      deletedCount,
    }
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

// We wouldn't need this in C# with LINQ's GroupBy...
function countBy<T>(array: Array<T>, key: keyof T) {
  return array
    .map(obj => obj[key])
    .reduce((accumulator, value) => {
      accumulator[value as any] = (accumulator[value] || 0) + 1 // eslint-disable-line @typescript-eslint/no-explicit-any
      return accumulator
    }, {} as Record<any, number>) // eslint-disable-line @typescript-eslint/no-explicit-any
}

// We wouldn't need this in C# with LINQ's OrderByDescending...
function orderByDescending(record: Record<any, number>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return Object.entries(record).sort((a, b) => b[1] - a[1])
}

function logStats(jobs: Array<Job>) {
  console.log("Nombre d'offres importées", jobs.length)
  const countsByCompany = orderByDescending(countBy(jobs, 'company'))
  console.log("Nombre d'offres importées par entreprise", countsByCompany)
  const countsByContractType = orderByDescending(countBy(jobs, 'contractType'))
  console.log("Nombre d'offres importées par type de contrat", countsByContractType)
}
