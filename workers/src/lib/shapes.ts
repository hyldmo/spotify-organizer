// Spotify's responses, cut down to what agents need. JSON.stringify drops the `undefined` fields.

export interface SpotifyTrack {
	type: 'track'
	name: string
	uri: string
	duration_ms: number
	explicit?: boolean
	artists: { name: string }[]
	album?: { name: string }
}

export interface SpotifyEpisode {
	type: 'episode'
	name: string
	uri: string
	duration_ms: number
	show?: { name: string }
}

export type SpotifyItem = SpotifyTrack | SpotifyEpisode

export interface SpotifyPlaylist {
	name: string
	uri: string
	public: boolean | null
	collaborative: boolean
	description: string | null
	owner: { id: string; display_name?: string | null }
	snapshot_id: string
	// Spotify renamed `tracks` to `items` in February 2026; apps outside development mode can still get `tracks`.
	items?: { total: number }
	tracks?: { total: number }
}

export interface SpotifyPage<T> {
	items: T[]
	total: number
	offset: number
}

export function duration(ms: number) {
	const seconds = Math.round(ms / 1000)
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function toItem(item: SpotifyItem | null | undefined) {
	if (!item) return { unavailable: true }
	if (item.type === 'episode') {
		return { uri: item.uri, name: item.name, show: item.show?.name, duration: duration(item.duration_ms) }
	}
	return {
		uri: item.uri,
		name: item.name,
		artists: item.artists.map(artist => artist.name),
		album: item.album?.name,
		duration: duration(item.duration_ms),
		explicit: item.explicit || undefined
	}
}

export function toPlaylist(playlist: SpotifyPlaylist) {
	return {
		uri: playlist.uri,
		name: playlist.name,
		owner: playlist.owner.display_name || playlist.owner.id,
		visibility: playlist.collaborative ? 'collaborative' : playlist.public ? 'public' : 'private',
		itemCount: (playlist.items ?? playlist.tracks)?.total,
		description: playlist.description || undefined,
		snapshotId: playlist.snapshot_id
	}
}

/** `nextOffset` is set while more results remain. Spotify returns `null` for items it can't show. */
export function toPage<T, R>(page: SpotifyPage<T | null>, map: (item: T, position: number) => R) {
	const end = page.offset + page.items.length
	return {
		total: page.total,
		offset: page.offset,
		nextOffset: end < page.total ? end : undefined,
		items: page.items.flatMap((item, i) => (item === null ? [] : [map(item, page.offset + i)]))
	}
}

/** Accepts a playlist ID, a `spotify:playlist:` URI or an open.spotify.com link. */
export function playlistId(value: string) {
	return /playlist[:/]([0-9A-Za-z]+)/.exec(value)?.[1] ?? value
}
