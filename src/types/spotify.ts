export interface Playlist extends SpotifyApi.PlaylistObjectSimplified {
	selected: boolean
	tracks: SpotifyApi.PlaylistObjectSimplified['tracks'] & {
		loaded: number
		items?: Track[]
	}
}

export enum Sort {
	Asc, Desc, None
}

export type TrackMeta = {
	added_at: SpotifyApi.PlaylistTrackObject['added_at'],
	added_by: SpotifyApi.PlaylistTrackObject['added_by'],
	is_local: SpotifyApi.PlaylistTrackObject['is_local']
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
