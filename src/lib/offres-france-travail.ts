import type { Job } from "./Job"

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

export async function getJobs(city: "rennes" | "bordeaux" | "paris"): Promise<Array<Job>> {
  const accessToken = await getAccessToken()

  const url = new URL("offres/search", baseUrl)
  url.searchParams.set("range", "0-5")
  url.searchParams.set("sort", "1") // Date de création horodatée décroissante, pertinence décroissante, distance croissante, origine de l’offre
  switch (city) {
    case "rennes":
      url.searchParams.set("commune", "35238")
      break
    case "bordeaux":
      url.searchParams.set("commune", "33063")
      break
    case "paris":
      url.searchParams.set("departement", "75")
      break
  }

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
  return data.resultats.map((job: FranceTravailJob) => ({
    intitule: job.intitule,
    description: job.description,
    url: job.contact?.urlPostulation || "",
    lieu: job.lieuTravail.libelle,
    salaire: job.salaire.libelle || job.salaire.commentaire,
    entreprise: job.entreprise.nom,
    typeContrat: job.typeContratLibelle,
    datePublication: new Date(job.dateCreation),
  }))
}

export async function getContractTypes() {
  const accessToken = await getAccessToken()

  const url = new URL("referentiel/typesContrats", baseUrl)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch contract types: ${response.statusText}`)
  }

  return await response.json()
}

export async function getMunicipalities() {
  const accessToken = await getAccessToken()

  const url = new URL("referentiel/communes", baseUrl)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch municipalities: ${response.statusText}`)
  }

  return await response.json()
}

type FranceTravailJob = {
  intitule: string
  description: string
  url: string
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
  contact?: {
    urlPostulation: string
  }
}

const baseUrl = "https://api.francetravail.io/partenaire/offresdemploi/v2/"