import { z } from 'zod'
import { type SpotifyPage, type SpotifyPlaylist, type SpotifyTrack, toItem, toPage, toPlaylist } from '../shapes'
import { procedure, router } from '../trpc'

interface SpotifyAlbum {
	name: string
	uri: string
	artists: { name: string }[]
	release_date?: string
	total_tracks?: number
}

interface SpotifyArtist {
	name: string
	uri: string
	genres?: string[]
}

const toResult: Record<'track' | 'album' | 'artist' | 'playlist', (item: unknown) => object> = {
	track: (item: unknown) => toItem(item as SpotifyTrack),
	playlist: (item: unknown) => toPlaylist(item as SpotifyPlaylist),
	album: (item: unknown) => {
		const album = item as SpotifyAlbum
		return {
			uri: album.uri,
			name: album.name,
			artists: album.artists.map(artist => artist.name),
			released: album.release_date,
			trackCount: album.total_tracks
		}
	},
	artist: (item: unknown) => {
		const artist = item as SpotifyArtist
		return { uri: artist.uri, name: artist.name, genres: artist.genres?.length ? artist.genres : undefined }
	}
}

export const catalogRouter = router({
	search: procedure
		.meta({
			description:
				'Search Spotify for tracks, albums, artists or playlists. Results include URIs for other tools.'
		})
		.input(
			z.object({
				query: z.string().min(1).describe('Search text. Supports filters such as artist:, album: and year:'),
				type: z.enum(['track', 'album', 'artist', 'playlist']).default('track'),
				limit: z.number().int().min(1).max(10).default(10),
				offset: z.number().int().min(0).max(1000).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			const result = await ctx.spotify.get<Record<string, SpotifyPage<unknown>>>('search', {
				q: input.query,
				type: input.type,
				limit: input.limit,
				offset: input.offset
			})
			return toPage(result[`${input.type}s`], toResult[input.type])
		})
})
