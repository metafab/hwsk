import type { Job } from "../shared/Job"
import { City } from "./City"
import { getAccessToken } from "./france-travail-auth"

export async function getJobs(city: City, count: number): Promise<Array<Job>> {
  const accessToken = await getAccessToken()

  const url = new URL("offres/search", BASE_URL)
  url.searchParams.set("range", `0-${count - 1}`)
  url.searchParams.set("inclureLimitrophes", "false")
  url.searchParams.set("distance", "0")
  url.searchParams.set("sort", "1") // Date de création horodatée décroissante, pertinence décroissante, distance croissante, origine de l’offre
  setCityFilter(city, url)

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

  return data.resultats
    .filter((job: FranceTravailJob) => isCityJob(city, job))
    .map((job: FranceTravailJob) => mapJob(city, job))
}

export async function getContractTypes() {
  const accessToken = await getAccessToken()

  const url = new URL("referentiel/typesContrats", BASE_URL)
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

  const url = new URL("referentiel/communes", BASE_URL)
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

function mapJob(city: City, job: FranceTravailJob): Job {
  return {
    id: job.id,
    title: job.intitule,
    description: job.description,
    url: job.contact?.urlPostulation || job.origineOffre.urlOrigine,
    city: city.toString(),
    location: job.lieuTravail.libelle,
    salary: job.salaire.libelle || job.salaire.commentaire,
    company: job.entreprise.nom,
    contractType: job.typeContratLibelle,
    createdAt: job.dateCreation,
    updatedAt: job.dateActualisation,
  }
}

function setCityFilter(city: City, url: URL) {
  switch (city) {
    case City.Rennes:
      url.searchParams.set("commune", RENNES_MUNICIPALITY_CODE)
      break
    case City.Bordeaux:
      url.searchParams.set("commune", BORDEAUX_MUNICIPALITY_CODE)
      break
    case City.Paris:
      url.searchParams.set("departement", PARIS_DEPARTMENT_CODE)
      break
    default:
      throw new Error(`City not supported: ${city}`)
  }
}

/**
 */
}

type FranceTravailJob = {
  id: string
  intitule: string
  description: string
  url: string
  lieuTravail: {
    libelle: string
    commune?: string
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

const BASE_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/"
const RENNES_MUNICIPALITY_CODE = "35238"
const BORDEAUX_MUNICIPALITY_CODE = "33063"
const PARIS_DEPARTMENT_CODE = "75"