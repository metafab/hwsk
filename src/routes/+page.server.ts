import { getJobs, getMunicipalities } from '$lib/offres-france-travail'
import { remult } from 'remult'
import { Job } from '../shared/Job'
import type { PageServerLoad, Actions } from './$types'

export const load = (async () => {
  return {
    // jobs: [
    //   {
    //     intitule: 'Offre 1',
    //   },
    //   {
    //     intitule: 'Offre 2',
    //   },
    // ],
  }
}) satisfies PageServerLoad


export const actions = {
  fetch: async ({ request }) => {
    const formData = await request.formData()
    const city = formData.get('city') as 'rennes' | 'bordeaux' | 'paris'
    const count = Number(formData.get('count'))

    const jobs = await getJobs(city, count)
    // console.log({ jobs })

    await saveJobs(jobs)

    return {
      jobs,
    }

    // const contractTypes = await getContractTypes()
    // console.log({ contractTypes })
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
  const repo = remult.repo(Job)
  await repo.insert(jobs)
}

