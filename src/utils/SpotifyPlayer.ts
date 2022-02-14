export let player: Spotify.Player | null = null

export async function initializePlayer(): Promise<Spotify.Player> {
	if (player !== null) return player

	const script = document.createElement('script')
	script.src = 'https://sdk.scdn.co/spotify-player.js'
	document.body.appendChild(script)

	return new Promise((resolve, reject) => {
		window.onSpotifyWebPlaybackSDKReady = () => {
			const token = localStorage.getItem('token')
			if (token) {
				console.info('Initializing Spotify Playback SDK')
			} else {
				reject(new Error('Cannot initialize Spotify Playback SDK, missing auth token'))
				return
			}

			player = new Spotify.Player({
				name: 'Web Playback SDK Quick Start Player',
				getOAuthToken: cb => cb(token),
				volume: 0.5
			})

			// Ready
			player.addListener('ready', ({ device_id }) => {
				console.info('Ready with Device ID', device_id)
				resolve(player)
			})

			// Not Ready
			player.addListener('not_ready', ({ device_id }) => {
				console.info('Device ID has gone offline', device_id)
			})

			player.addListener('initialization_error', ({ message }) => {
				reject(message)
			})

			player.addListener('authentication_error', ({ message }) => {
				console.error(message)
			})

			player.addListener('account_error', ({ message }) => {
				console.error(message)
			})

			player.connect()
		}
	})
}
