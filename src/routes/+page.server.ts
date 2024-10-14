import { getJobs } from '$lib/offres-france-travail'
import type { PageServerLoad, Actions } from './$types'

export const load = (async () => {
  return {
    jobs: [
      {
        intitule: 'Offre 1',
      },
      {
        intitule: 'Offre 2',
      },
    ],
  }
}) satisfies PageServerLoad


export const actions = {
  fetch: async ({ request }) => {
    const data = await request.formData()
    console.log(data)

    const jobs = await getJobs()
    console.log({ jobs })

    // const contractTypes = await getContractTypes()
    // console.log({ contractTypes })
  },
} satisfies Actions

