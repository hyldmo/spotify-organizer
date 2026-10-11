import { z } from 'zod'
import { type SpotifyPage, type SpotifyTrack, toItem, toPage } from '../shapes'
import { procedure, router } from '../trpc'

const libraryUris = z
	.array(z.string().regex(/^spotify:(track|album|episode|show|audiobook):[0-9A-Za-z]+$/))
	.min(1)
	.max(40)
	.describe('Spotify URIs of tracks, albums, episodes, shows or audiobooks (max 40)')

export const libraryRouter = router({
	savedTracks: procedure
		.meta({ description: "List the user's Liked Songs, newest first." })
		.input(
			z.object({
				limit: z.number().int().min(1).max(50).default(20),
				offset: z.number().int().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			const page = await ctx.spotify.get<SpotifyPage<{ added_at: string; track: SpotifyTrack }>>(
				'me/tracks',
				input
			)
			return toPage(page, ({ added_at, track }) => ({ ...toItem(track), addedAt: added_at }))
		}),

	contains: procedure
		.meta({ description: "Check whether items are saved in the user's library." })
		.input(z.object({ uris: libraryUris }))
		.query(async ({ ctx, input }) => {
			const saved = await ctx.spotify.get<boolean[]>('me/library/contains', { uris: input.uris.join(',') })
			return Object.fromEntries(input.uris.map((uri, i) => [uri, saved[i]]))
		}),

	save: procedure
		.meta({ description: "Save items to the user's library. Saved tracks go to Liked Songs." })
		.input(z.object({ uris: libraryUris }))
		.mutation(({ ctx, input }) => ctx.spotify.put<void>('me/library', { uris: input.uris.join(',') })),

	remove: procedure
		.meta({ description: "Remove items from the user's library. Removed tracks leave Liked Songs." })
		.input(z.object({ uris: libraryUris }))
		.mutation(({ ctx, input }) => ctx.spotify.delete<void>('me/library', { uris: input.uris.join(',') }))
})
