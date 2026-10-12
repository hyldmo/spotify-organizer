import { z } from 'zod'
import { playlistId, type SpotifyTrack, toItem } from '../shapes'
import { protectedProcedure, router } from '../trpc'

/** contextUri → trackId → count */
type Counters = Record<string, Record<string, number>>

interface StatRow {
	context_uri: string
	track_id: string
	plays: number
	skips: number
}

const contextUri = z.string().min(1).max(200)
const trackId = z.string().regex(/^[0-9A-Za-z]{1,64}$/)
const playlist = z.string().min(1).describe('Playlist ID, spotify:playlist: URI or open.spotify.com link')

const playlistUri = (value: string) => `spotify:playlist:${playlistId(value)}`

function setCount(counters: Counters, row: StatRow, count: number) {
	const context = counters[row.context_uri] ?? {}
	context[row.track_id] = count
	counters[row.context_uri] = context
}

export const statsRouter = router({
	// all, record and clearSkips have no description, so MCP doesn't list them: they exist for the web app.
	all: protectedProcedure.query(async ({ ctx }) => {
		const { results } = await ctx.db
			.prepare('SELECT context_uri, track_id, plays, skips FROM track_stats WHERE user_id = ?')
			.bind(ctx.userId)
			.all<StatRow>()
		const plays: Counters = {}
		const skips: Counters = {}
		for (const row of results) {
			if (row.plays) setCount(plays, row, row.plays)
			if (row.skips) setCount(skips, row, row.skips)
		}
		return { plays, skips }
	}),

	record: protectedProcedure
		.input(z.object({ kind: z.enum(['play', 'skip']), contextUri, trackId }))
		.mutation(async ({ ctx, input }) => {
			const play = input.kind === 'play' ? 1 : 0
			await ctx.db
				.prepare(
					`INSERT INTO track_stats (user_id, context_uri, track_id, plays, skips) VALUES (?1, ?2, ?3, ?4, ?5)
					ON CONFLICT (user_id, context_uri, track_id)
					DO UPDATE SET plays = plays + excluded.plays, skips = skips + excluded.skips`
				)
				.bind(ctx.userId, input.contextUri, input.trackId, play, 1 - play)
				.run()
		}),

	clearSkips: protectedProcedure.input(z.object({ contextUri, trackId })).mutation(async ({ ctx, input }) => {
		await ctx.db
			.prepare('UPDATE track_stats SET skips = 0 WHERE user_id = ? AND context_uri = ? AND track_id = ?')
			.bind(ctx.userId, input.contextUri, input.trackId)
			.run()
	}),

	forPlaylist: protectedProcedure
		.meta({
			description:
				'Play and skip counts for tracks in a playlist, recorded by Spotify Organiser while the user listened to it. Join with playlist_items on uri.'
		})
		.input(z.object({ playlistId: playlist }))
		.query(async ({ ctx, input }) => {
			const { results } = await ctx.db
				.prepare(
					'SELECT track_id, plays, skips FROM track_stats WHERE user_id = ? AND context_uri = ? ORDER BY skips DESC, plays DESC'
				)
				.bind(ctx.userId, playlistUri(input.playlistId))
				.all<StatRow>()
			return results.map(row => ({ uri: `spotify:track:${row.track_id}`, plays: row.plays, skips: row.skips }))
		}),

	mostSkipped: protectedProcedure
		.meta({
			description:
				'The tracks the user skips most, in all playlists or in one, as recorded by Spotify Organiser. Use it to find tracks to remove.'
		})
		.input(
			z.object({
				playlistId: playlist.optional(),
				limit: z.number().int().min(1).max(20).default(10)
			})
		)
		.query(async ({ ctx, input }) => {
			const filter = input.playlistId ? 'AND context_uri = ?' : ''
			const params = input.playlistId
				? [ctx.userId, playlistUri(input.playlistId), input.limit]
				: [ctx.userId, input.limit]
			const { results } = await ctx.db
				.prepare(
					`SELECT context_uri, track_id, plays, skips FROM track_stats
					WHERE user_id = ? ${filter} AND skips > 0 ORDER BY skips DESC, plays ASC LIMIT ?`
				)
				.bind(...params)
				.all<StatRow>()
			// Spotify removed its batch track lookup for development-mode apps, so names come one track at a time.
			const tracks = await Promise.all(
				results.map(row => ctx.spotify.get<SpotifyTrack>(`tracks/${row.track_id}`).catch(() => null))
			)
			return results.map((row, i) => ({
				...toItem(tracks[i]),
				uri: `spotify:track:${row.track_id}`,
				context: row.context_uri,
				plays: row.plays,
				skips: row.skips
			}))
		})
})
