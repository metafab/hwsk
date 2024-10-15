import type { Job } from "../shared/Job"
import { City } from "./City"
import { getAccessToken } from "./france-travail-auth"

export async function* getJobs(city: City, afterDate: Date | undefined): AsyncGenerator<Job> {
  const accessToken = await getAccessToken()

  while (true) {
    // Fetch jobs from the API by batch
    const jobs = await getJobsBatch(city, afterDate, 20, accessToken)
    if (!jobs.length) {
      break
    }
    for (const job of jobs) {
      yield job
    }
    afterDate = jobs[0].createdAt
  }
}

async function getJobsBatch(city: City, afterDate: Date | undefined, maxCount: number, accessToken: string): Promise<Array<Job>> {
  const url = buildJobSeachUrl(city, afterDate, maxCount)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}\n${await response.text()}`)
  }
  if (!response.body) {
    return []
  }

  const data = await response.json()
  // console.log(JSON.stringify(data, null, 2))

  return data.resultats
    .map((job: FranceTravailJob) => mapJob(city, job))
    // Sort by creation date descending as the API sort seems not to be reliable
    .sort((a: Job, b: Job) => b.createdAt!.valueOf() - a.createdAt!.valueOf())
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
    createdAt: new Date(job.dateCreation),
    updatedAt: job.dateActualisation ? new Date(job.dateActualisation) : undefined,
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

function buildJobSeachUrl(city: City, afterDate: Date | undefined, maxCount: number): URL {
  const url = new URL("offres/search", BASE_URL)
  if (afterDate) {
    // Min date granularity is 1 second
    const minDate = new Date(afterDate)
    minDate.setSeconds(minDate.getSeconds() + 1)

    // Max date arbitrarily far in the future because we want all jobs after the min date and maxCreationDate is required
    const maxDate = new Date(minDate)
    maxDate.setFullYear(maxDate.getFullYear() + 1)

    url.searchParams.set("minCreationDate", formatDate(minDate))
    url.searchParams.set("maxCreationDate", formatDate(maxDate))
  }

  // Limit the search to the city and exclude neighboring municipalities
  setCityFilter(city, url)
  url.searchParams.set("inclureLimitrophes", "false")
  url.searchParams.set("distance", "0")

  url.searchParams.set("range", `0-${maxCount - 1}`)
  url.searchParams.set("sort", "1") // Date de création horodatée décroissante, pertinence décroissante, distance croissante, origine de l’offre

  return url
}

/**
 * Formats the date to the ISO string format required by the API (without the milliseconds)
 */
function formatDate(date: Date) {
  return date.toISOString().slice(0, -5) + "Z"
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
  dateCreation: string
  dateActualisation?: string
  contact?: {
    urlPostulation: string
  }
  origineOffre: {
    urlOrigine: string
  }
  typeContrat: string
}

const BASE_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/"
const RENNES_MUNICIPALITY_CODE = "35238"
const BORDEAUX_MUNICIPALITY_CODE = "33063"
const PARIS_DEPARTMENT_CODE = "75"
