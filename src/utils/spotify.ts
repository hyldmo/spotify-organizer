/* eslint-disable camelcase */
import { Album, Artist, SpotifyObjectType, Track, URI } from 'types'

export function isPlaylist(obj: SpotifyApi.ContextObject | null | undefined): obj is SpotifyApi.ContextObject {
	return obj?.type === 'playlist'
}

export function getUriType<T extends string>(uri: T): T extends URI<infer R> ? R : SpotifyObjectType {
	return uri.split(':')[1] as any
}

export function idToUri<T extends SpotifyObjectType>(id: string, type: T): URI<T> {
	return `spotify:${type}:${id}`
}
export function UriToId<T extends URI>(uri: T): T extends `spotify:${string}:${infer R}` ? R : never {
	return uri.split(':').pop() as any
}

type Playlist = SpotifyApi.PlaylistTrackObject

export function toTrack<T extends Playlist | SpotifyApi.TrackObjectFull>(
	t: T,
	position?: number
): T extends Playlist ? Track : Omit<Track, 'meta'> & { meta?: Track['meta'] } {
	const isPl = (obj: Playlist | SpotifyApi.TrackObjectFull): obj is Playlist =>
		(obj as Playlist).added_at !== undefined

	const p = isPl(t) ? t : { track: t as SpotifyApi.TrackObjectFull }

	return {
		id: p.track.id,
		name: p.track.name,
		uri: p.track.uri as Track['uri'],
		artists: p.track.artists.map(artist => ({
			id: artist.id,
			name: artist.name,
			uri: artist.uri as Artist['uri']
		})),
		album: {
			id: p.track.album.id,
			name: p.track.album.name,
			uri: p.track.album.uri as Album['uri'],
			images: p.track.album.images
		},
		duration_ms: p.track.duration_ms,
		meta: isPl(t)
			? {
					added_at: t.added_at,
					added_by: t.added_by,
					is_local: t.is_local,
					index: typeof position === 'number' ? position : -1
			  }
			: undefined
	} as Track
}
