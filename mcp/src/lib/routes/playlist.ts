import { z } from 'zod'
import {
	playlistId,
	type SpotifyItem,
	type SpotifyPage,
	type SpotifyPlaylist,
	toItem,
	toPage,
	toPlaylist
} from '../shapes'
import { procedure, router } from '../trpc'

interface SpotifyPlaylistEntry {
	added_at: string
	is_local: boolean
	// `item` replaced `track` in February 2026.
	item?: SpotifyItem | null
	track?: SpotifyItem | null
}

const playlist = z.string().min(1).describe('Playlist ID, spotify:playlist: URI or open.spotify.com link')
const itemUris = z
	.array(z.string().regex(/^spotify:(track|episode):[0-9A-Za-z]+$/))
	.min(1)
	.max(100)
	.describe('Spotify URIs of tracks or episodes (max 100)')
const snapshotId = z
	.string()
	.optional()
	.describe('snapshotId from playlist_get. Spotify rejects the change if the playlist changed since then.')

export const playlistRouter = router({
	list: procedure
		.meta({ description: 'List the playlists the user owns or follows.' })
		.input(
			z.object({
				limit: z.number().int().min(1).max(50).default(50),
				offset: z.number().int().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) =>
			toPage(await ctx.spotify.get<SpotifyPage<SpotifyPlaylist>>('me/playlists', input), toPlaylist)
		),

	get: procedure
		.meta({ description: "Get a playlist's name, owner, description, visibility, item count and snapshotId." })
		.input(z.object({ playlistId: playlist }))
		.query(async ({ ctx, input }) =>
			toPlaylist(await ctx.spotify.get<SpotifyPlaylist>(`playlists/${playlistId(input.playlistId)}`))
		),

	items: procedure
		.meta({
			description:
				'List the tracks and episodes in a playlist with their 0-based positions. Spotify only returns items for playlists the user owns or collaborates on.'
		})
		.input(
			z.object({
				playlistId: playlist,
				limit: z.number().int().min(1).max(50).default(50),
				offset: z.number().int().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			const page = await ctx.spotify.get<SpotifyPage<SpotifyPlaylistEntry>>(
				`playlists/${playlistId(input.playlistId)}/items`,
				{ limit: input.limit, offset: input.offset }
			)
			return toPage(page, (entry, position) => ({
				position,
				...toItem(entry.item ?? entry.track),
				addedAt: entry.added_at,
				localFile: entry.is_local || undefined
			}))
		}),

	create: procedure
		.meta({ description: 'Create a playlist for the user. It starts empty; add items with playlist_addItems.' })
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				public: z.boolean().default(false)
			})
		)
		.mutation(async ({ ctx, input }) =>
			toPlaylist(await ctx.spotify.post<SpotifyPlaylist>('me/playlists', undefined, input))
		),

	update: procedure
		.meta({ description: "Change a playlist's name, description, visibility or collaborative setting." })
		.input(
			z.object({
				playlistId: playlist,
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				public: z.boolean().optional(),
				collaborative: z.boolean().optional().describe('Collaborative playlists must also be private')
			})
		)
		.mutation(async ({ ctx, input: { playlistId: id, ...changes } }) => {
			if (Object.values(changes).every(value => value === undefined)) {
				throw new Error('Pass at least one of name, description, public or collaborative.')
			}
			await ctx.spotify.put(`playlists/${playlistId(id)}`, undefined, changes)
		}),

	addItems: procedure
		.meta({ description: 'Add tracks or episodes to a playlist, at the end or at a 0-based position.' })
		.input(z.object({ playlistId: playlist, uris: itemUris, position: z.number().int().min(0).optional() }))
		.mutation(async ({ ctx, input }) => {
			const { snapshot_id } = await ctx.spotify.post<{ snapshot_id: string }>(
				`playlists/${playlistId(input.playlistId)}/items`,
				undefined,
				{ uris: input.uris, position: input.position }
			)
			return { snapshotId: snapshot_id }
		}),

	removeItems: procedure
		.meta({ description: 'Remove tracks or episodes from a playlist. This removes every occurrence of each URI.' })
		.input(z.object({ playlistId: playlist, uris: itemUris, snapshotId }))
		.mutation(async ({ ctx, input }) => {
			const { snapshot_id } = await ctx.spotify.delete<{ snapshot_id: string }>(
				`playlists/${playlistId(input.playlistId)}/items`,
				undefined,
				{ items: input.uris.map(uri => ({ uri })), snapshot_id: input.snapshotId }
			)
			return { snapshotId: snapshot_id }
		}),

	reorder: procedure
		.meta({
			description:
				'Move a run of consecutive items in a playlist. Positions are 0-based, as listed by playlist_items.',
			// A move is relative: repeating it moves the items again.
			idempotent: false
		})
		.input(
			z.object({
				playlistId: playlist,
				rangeStart: z.number().int().min(0).describe('Position of the first item to move'),
				insertBefore: z.number().int().min(0).describe('Position to move the items in front of'),
				rangeLength: z.number().int().min(1).default(1),
				snapshotId
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { snapshot_id } = await ctx.spotify.put<{ snapshot_id: string }>(
				`playlists/${playlistId(input.playlistId)}/items`,
				undefined,
				{
					range_start: input.rangeStart,
					insert_before: input.insertBefore,
					range_length: input.rangeLength,
					snapshot_id: input.snapshotId
				}
			)
			return { snapshotId: snapshot_id }
		})
})
