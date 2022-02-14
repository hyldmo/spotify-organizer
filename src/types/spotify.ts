export interface Playlist extends SpotifyApi.PlaylistObjectSimplified {
	selected: boolean
	description: SpotifyApi.PlaylistObjectFull['description']
	tracks: SpotifyApi.PlaylistObjectSimplified['tracks'] & {
		loaded: number
		lastFetched: Date | null
		items?: Track[]
	}
	uri: `spotify:playlist:${string}`
}

export type User = Omit<SpotifyApi.UserObjectPublic, 'display_name'> & {
	name: string | null
	image: string | null
	token: string
}

export interface TrackMeta {
	added_at: SpotifyApi.PlaylistTrackObject['added_at']
	added_by: SpotifyApi.PlaylistTrackObject['added_by']
	is_local: SpotifyApi.PlaylistTrackObject['is_local']
	// Position of track in playlist
	index: number
}

export type URI = Track['uri'] | Artist['uri'] | Album['uri'] | Playlist['uri']

export interface Track {
	id: SpotifyApi.TrackObjectFull['id']
	name: SpotifyApi.TrackObjectFull['name']
	uri: `spotify:track:${string}`
	artists: Artist[]
	album: Album
	duration_ms: SpotifyApi.TrackObjectFull['duration_ms']
	meta: TrackMeta
}

export interface Artist {
	uri: `spotify:artist:${string}`
	id: SpotifyApi.ArtistObjectSimplified['id']
	name: SpotifyApi.ArtistObjectSimplified['name']
}

export interface Album {
	uri: `spotify:album:${string}`
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
