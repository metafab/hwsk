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
    const accessToken = await getAccessToken()
    console.log({ accessToken })

    const data = await request.formData()
    console.log(data)

    const jobs = await getJobs(accessToken)
    console.log({ jobs })
  },
} satisfies Actions

async function getAccessToken() {
  const response = await fetch("https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire", {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams([
      ["grant_type", "client_credentials"],
      ["client_id", "PAR_hellowork_32213dc571edaf23011c248445507077b0a27f742b0dbcb48f1667ec08a6a98e"],
      ["client_secret", "1e99827a1dfa2aa83dfa011d5f44fca96e7295a45e1e2f36c32345222c25662f"],
      ["scope", "api_offresdemploiv2 o2dsoffre"],
    ]),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch access token')
  }

  const data = await response.json()
  return data.access_token
}

async function getJobs(accessToken: string) {
  const url = new URL("https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search")
  url.searchParams.set("range", "0-5")
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`)
  }

  const data = await response.json()
  console.log({ data })
  return data.resultats.map((job: Job) => ({
    intitule: job.intitule,
    // description: job.description,
    lieu: job.lieuTravail.libelle,
    salaire: job.salaire.libelle || job.salaire.commentaire,
    entreprise: job.entreprise.nom,
    typeContrat: job.typeContratLibelle,
    datePublication: new Date(job.dateCreation),
  }))
}

type Job = {
  intitule: string
  lieuTravail: {
    libelle: string
  }
  salaire: {
    libelle: string
    commentaire: string
  }
  entreprise: {
    nom: string
  }
  typeContratLibelle: string
  dateCreation: string
}
