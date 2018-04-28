export interface Playlist extends SpotifyApi.PlaylistObjectSimplified {
	selected: boolean
	description?: SpotifyApi.PlaylistObjectFull['description']
	tracks: SpotifyApi.PlaylistObjectSimplified['tracks'] & {
		loaded: number
		items?: Track[]
	}
}

export enum Sort {
	Asc, Desc, None
}

export interface TrackMeta {
	added_at: SpotifyApi.PlaylistTrackObject['added_at'],
	added_by: SpotifyApi.PlaylistTrackObject['added_by'],
	is_local: SpotifyApi.PlaylistTrackObject['is_local']
	// Position of track in playlist
	index: number
}

export interface Track {
	id: SpotifyApi.TrackObjectFull['id']
	name: SpotifyApi.TrackObjectFull['name']
	artists: Array<{
		id: SpotifyApi.ArtistObjectSimplified['id']
		name: SpotifyApi.ArtistObjectSimplified['name']
	}>
	album: {
		id: SpotifyApi.AlbumObjectSimplified['id']
		name: SpotifyApi.AlbumObjectSimplified['name']
	}
	duration_ms: SpotifyApi.TrackObjectFull['duration_ms']
	meta: TrackMeta
}
