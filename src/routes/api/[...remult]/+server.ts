import { remultSveltekit } from 'remult/remult-sveltekit'
import { Job } from '../../../shared/Job'

export const _api = remultSveltekit({
  entities: [Job],
  admin: true
})

// export const { GET, POST, PUT, DELETE } = _api
export const GET = _api.GET
export const POST = _api.POST
export const PUT = _api.PUT
export const DELETE = _api.DELETE