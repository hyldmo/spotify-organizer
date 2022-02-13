export interface Playlist extends SpotifyApi.PlaylistObjectSimplified {
	selected: boolean
	description: SpotifyApi.PlaylistObjectFull['description']
	tracks: SpotifyApi.PlaylistObjectSimplified['tracks'] & {
		loaded: number
		lastFetched: Date | null
		items?: Track[]
	}
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

export interface Track {
	id: SpotifyApi.TrackObjectFull['id']
	name: SpotifyApi.TrackObjectFull['name']
	uri: SpotifyApi.TrackObjectFull['uri']
	artists: Array<{
		uri: SpotifyApi.ArtistObjectSimplified['uri']
		id: SpotifyApi.ArtistObjectSimplified['id']
		name: SpotifyApi.ArtistObjectSimplified['name']
	}>
	album: {
		uri: SpotifyApi.AlbumObjectSimplified['uri']
		id: SpotifyApi.AlbumObjectSimplified['id']
		name: SpotifyApi.AlbumObjectSimplified['name']
	}
	duration_ms: SpotifyApi.TrackObjectFull['duration_ms']
	meta: TrackMeta
}

export type RemoveTracksRequest = {
	tracks: Array<{
		uri: string
		positions?: number[]
	}>
	snapshot_id: string
}
