import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../workers/src/lib/router'

/** Spotify Organiser's own API (workers/). It finds the user from their Spotify access token. */
export const api = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc',
			headers: () => ({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` })
		})
	]
})
