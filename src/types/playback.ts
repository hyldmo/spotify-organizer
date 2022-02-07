export type SkipEntry = {
	song: SpotifyApi.TrackObjectFull
	playlists: Array<{
		skips: number
		name: string | null
		uri: string
	}>
	totalSkips: number
}

export type Playback = SpotifyApi.CurrentPlaybackResponse &
	SpotifyApi.CurrentlyPlayingObject & {
		item?: SpotifyApi.TrackObjectFull
	}
