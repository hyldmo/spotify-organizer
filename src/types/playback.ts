import { Playlist, Track, URI } from './spotify'

export type SkipEntry = {
	song: Partial<Track> & { uri: Track['uri'] }
	playlists: SkipEntryPlaylist[]
}

export type SkipEntryPlaylist = Partial<Playlist> & {
	plays: number
	skips: number
	uri: URI | 'unknown'
}

export type PlaylistSkipEntry = Partial<Playlist> & {
	songs: PlaylistSkipSongEntry[]
	uri: URI | 'unknown'
}
export type PlaylistSkipSongEntry = {
	id: string
	plays?: number
	skips?: number
}

export type Playback = SpotifyApi.CurrentPlaybackResponse &
	SpotifyApi.CurrentlyPlayingObject & {
		item?: SpotifyApi.TrackObjectFull
	}
