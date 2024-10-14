import { getJobs, getMunicipalities } from '$lib/offres-france-travail'
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
} satisfies Actions

