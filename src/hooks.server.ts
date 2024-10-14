// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { _api } from './routes/api/[...remult]/+server'

/**
 * Handle remult server side
 */
const handleRemult: Handle = async ({ event, resolve }) => {
  return await _api.withRemult(event, async () => await resolve(event))
}

export const handle = sequence(
  handleRemult,
)