export type SkipEntry = {
	song: SpotifyApi.TrackObjectFull
	playlists: SkipEntryPlaylist[]
	totalSkips: number
}

export type SkipEntryPlaylist = {
	skips: number
	name: string | null
	uri: string
}

export type Playback = SpotifyApi.CurrentPlaybackResponse &
	SpotifyApi.CurrentlyPlayingObject & {
		item?: SpotifyApi.TrackObjectFull
	}
