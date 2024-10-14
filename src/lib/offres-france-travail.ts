import { FRANCE_TRAVAIL_CLIENT_ID, FRANCE_TRAVAIL_CLIENT_SECRET } from "$env/static/private"
import type { Job } from "../shared/Job"

async function getAccessToken() {
  const response = await fetch("https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire", {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams([
      ["grant_type", "client_credentials"],
      ["client_id", FRANCE_TRAVAIL_CLIENT_ID],
      ["client_secret", FRANCE_TRAVAIL_CLIENT_SECRET],
      ["scope", "api_offresdemploiv2 o2dsoffre"],
    ]),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch access token')
  }

  const data = await response.json()
  return data.access_token
}

export async function getJobs(city: "rennes" | "bordeaux" | "paris", count: number): Promise<Array<Job>> {
  const accessToken = await getAccessToken()

  const url = new URL("offres/search", baseUrl)
  url.searchParams.set("range", `0-${count - 1}`)
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
  // console.log(JSON.stringify(data, null, 2))

  return data.resultats.map((job: FranceTravailJob) => mapJob(city, job))
}

function mapJob(city: string, job: FranceTravailJob): Job {
  return {
    id: job.id,
    title: job.intitule,
    description: job.description,
    url: job.contact?.urlPostulation || job.origineOffre.urlOrigine,
    city,
    location: job.lieuTravail.libelle,
    salary: job.salaire.libelle || job.salaire.commentaire,
    company: job.entreprise.nom,
    contractType: job.typeContratLibelle,
    // createdAt: new Date(job.dateCreation),
    createdAt: job.dateCreation,
    updatedAt: job.dateActualisation,
  }
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
  id: string
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
  dateCreation: Date
  dateActualisation?: Date
  contact?: {
    urlPostulation: string
  }
  origineOffre: {
    urlOrigine: string
  }
}

const baseUrl = "https://api.francetravail.io/partenaire/offresdemploi/v2/"