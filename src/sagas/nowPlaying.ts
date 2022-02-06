/* eslint-disable camelcase */
import { Action, Actions } from '../actions'
import { call, cancelled, put, takeLatest } from 'typed-redux-saga'
import { sleep } from '../utils'
import { spotifyFetch } from './spotifyFetch'
import { Playback } from 'types'

window.onSpotifyWebPlaybackSDKReady = () => {
	const token = localStorage.getItem('token')
	if (token) {
		console.info('Initializing Spotify Playback SDK')
	} else {
		console.warn('Cannot initialize Spotify Playback SDK, missing auth token')
		return
	}

	const player = new Spotify.Player({
		name: 'Web Playback SDK Quick Start Player',
		getOAuthToken: cb => {
			cb(token)
		},
		volume: 0.5
	})

	// Ready
	player.addListener('ready', ({ device_id }) => {
		console.info('Ready with Device ID', device_id)
	})

	// Not Ready
	player.addListener('not_ready', ({ device_id }) => {
		console.info('Device ID has gone offline', device_id)
	})

	player.addListener('initialization_error', ({ message }) => {
		console.error(message)
	})

	player.addListener('authentication_error', ({ message }) => {
		console.error(message)
	})

	player.addListener('account_error', ({ message }) => {
		console.error(message)
	})

	player.connect()
}

export default function* () {
	yield* takeLatest(Actions.userLoaded.type, watchPlayback)
}

function* watchPlayback(_action: Action<'USER_LOADED'>) {
	let timeout = 5000
	while (true) {
		try {
			const body: SpotifyApi.CurrentPlaybackResponse = yield* call(spotifyFetch, 'me/player')
			yield* put(Actions.updatePlayback(body as Playback))
			timeout = 5000
			yield
		} catch (e) {
			console.warn(`${watchPlayback.name}:`, e)
			timeout *= 2
		}
		if (yield* cancelled()) {
			break
		} else {
			yield* call(sleep, timeout)
		}
	}
}
