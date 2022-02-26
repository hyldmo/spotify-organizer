import { SongEntries } from './firebase'
import { Nullable } from './helpers'

export interface Playlist extends SpotifyApi.PlaylistObjectSimplified {
	selected: boolean
	description: SpotifyApi.PlaylistObjectFull['description']
	tracks: SpotifyApi.PlaylistObjectSimplified['tracks'] & {
		loaded: number
		lastFetched: Date | null
		items: SongEntries
	}
	uri: `spotify:playlist:${string}`
}

export type User = Omit<SpotifyApi.UserObjectPublic, 'display_name'> & {
	name: string | null
	image: string | null
	token: string

	settings: {
		watchSkips: boolean
	}
}

export interface TrackMeta {
	added_at: SpotifyApi.PlaylistTrackObject['added_at']
	added_by: SpotifyApi.PlaylistTrackObject['added_by']
	is_local: SpotifyApi.PlaylistTrackObject['is_local']
	// Position of track in playlist
	index: number
	plays?: number
	skips?: number
}
export type SpotifyObjectType = SpotifyApi.ContextObject['type'] | 'track'
export type URI<T extends SpotifyObjectType = SpotifyObjectType> = `spotify:${T}:${string}`

export type UriObject<T = string> = {
	name?: Nullable<string>
	display_name?: Nullable<string>
	uri: T extends SpotifyObjectType ? URI<T> : string
}

export interface Track {
	id: SpotifyApi.TrackObjectFull['id']
	name: SpotifyApi.TrackObjectFull['name']
	uri: URI<'track'>
	artists: Artist[]
	album: Album
	duration_ms: SpotifyApi.TrackObjectFull['duration_ms']
	meta: TrackMeta
}

export interface Artist {
	uri: URI<'artist'>
	id: SpotifyApi.ArtistObjectSimplified['id']
	name: SpotifyApi.ArtistObjectSimplified['name']
}

export interface Album {
	uri: URI<'album'>
	id: SpotifyApi.AlbumObjectSimplified['id']
	name: SpotifyApi.AlbumObjectSimplified['name']
	images: SpotifyApi.AlbumObjectSimplified['images']
}

export type RemoveTracksRequest = {
	tracks: Array<{
		uri: Track['uri']
		positions?: number[]
	}>
	snapshot_id: string
}
