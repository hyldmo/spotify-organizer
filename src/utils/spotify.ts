export function isPlaylist(obj: SpotifyApi.ContextObject | null | undefined): obj is SpotifyApi.ContextObject {
	return obj?.type === 'playlist'
}
