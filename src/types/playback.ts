import { Track, URI } from './spotify'

export type SkipEntry = {
	song: SpotifyApi.TrackObjectFull & { uri: Track['uri'] }
	playlists: SkipEntryPlaylist[]
	totalSkips: number
}

export type SkipEntryPlaylist = {
	skips: number
	name: string | null
	uri: URI | 'unknown'
}

export type Playback = SpotifyApi.CurrentPlaybackResponse &
	SpotifyApi.CurrentlyPlayingObject & {
		item?: SpotifyApi.TrackObjectFull
	}
