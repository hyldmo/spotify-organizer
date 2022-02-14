import { Playlist, Track, URI } from './spotify'

export type SkipEntry = {
	song: Partial<Track> & { uri: Track['uri'] }
	playlists: SkipEntryPlaylist[]
}

export type SkipStats = {
	plays?: number
	skips?: number
}

export type SkipEntryPlaylist = Partial<Playlist> &
	Required<SkipStats> & {
		uri: URI | 'unknown'
	}

export type PlaylistSkipEntry = Partial<Playlist> & {
	songs: PlaylistSkipSongEntry[]
	uri: URI | 'unknown'
}
export type PlaylistSkipSongEntry = SkipStats & {
	id: string
}

export type Playback = SpotifyApi.CurrentPlaybackResponse &
	SpotifyApi.CurrentlyPlayingObject & {
		item?: SpotifyApi.TrackObjectFull
	}
