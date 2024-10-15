import type { Job } from "../shared/Job"
import { City } from "./City"
import { getAccessToken } from "./france-travail-auth"

/**
 * Generator that fetches jobs from the France Travail API.
 *
 * @param city - The city to fetch jobs for.
 * @param afterDate - The date after which to fetch jobs.
 * @returns An asynchronous generator that yields jobs.
 */
export async function* getJobs(city: City, afterDate: Date | undefined): AsyncGenerator<Job> {
  const accessToken = await getAccessToken()

  const batchSize = 100
  let start = 0
  let end = start + batchSize - 1
  while (true) {
    // Fetch jobs from the API for the current range
    const result = await getJobsRange(city, afterDate, start, end, accessToken)

    for (const job of result.jobs) {
      yield job
    }

    if (result.responseRange.end >= result.responseRange.total - 1) {
      return
    }

    start = end + 1
    end = Math.min(start + batchSize, result.responseRange.total - 1)
  }
}

async function getJobsRange(city: City, afterDate: Date | undefined, start: number, end: number, accessToken: string):
  Promise<{ responseRange: ResponseRange, jobs: Array<Job> }> {
  const url = buildJobSeachUrl(city, afterDate, start, end)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}\n${await response.text()}`)
  }

  const responseRange = parseResponseRangeHeader(response.headers.get("Content-Range"))

  if (!response.body) {
    return { responseRange: { start: 0, end: 0, total: 0 }, jobs: [] }
  }

  const data = await response.json()
  const jobs = data.resultats.map((job: FranceTravailJob) => mapJob(city, job))

  return { responseRange, jobs }
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

function buildJobSeachUrl(city: City, afterDate: Date | undefined, start: number, end: number): URL {
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

  url.searchParams.set("range", `${start}-${end}`)
  url.searchParams.set("sort", "1") // Date de création horodatée décroissante, pertinence décroissante, distance croissante, origine de l’offre

  return url
}

/**
 * Formats the date to the ISO string format required by the API (without the milliseconds)
 */
function formatDate(date: Date) {
  return date.toISOString().slice(0, -5) + "Z"
}

/**
 * Parses the Content-Range header from the API's response.
 */
function parseResponseRangeHeader(header: string | null) {
  // Not documented but the API seems to return "*/0" when there are no jobs
  if (!header || header.endsWith("/0")) {
    return { start: 0, end: 0, total: 0 }
  }

  /*
  Format : "offres p-d/t", où
    p est l’index (débutant à 0) du premier élément renvoyé
    d est l’index de dernier élément renvoyé
    t est le nombre total d’éléments de la recherche
  */

  const [_, start, end, total] = header.match(/offres (\d+)-(\d+)\/(\d+)/) || [] // eslint-disable-line @typescript-eslint/no-unused-vars
  return { start: parseInt(start), end: parseInt(end), total: parseInt(total) }
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

type ResponseRange = {
  start: number
  end: number
  total: number
}

const BASE_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/"
const RENNES_MUNICIPALITY_CODE = "35238"
const BORDEAUX_MUNICIPALITY_CODE = "33063"
const PARIS_DEPARTMENT_CODE = "75"