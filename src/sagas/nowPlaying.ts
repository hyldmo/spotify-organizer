/* eslint-disable camelcase */
import { Action, Actions } from '../actions'
import { call, cancelled, fork, put, select } from 'typed-redux-saga'
import { sleep } from 'utils'
import { spotifyFetch } from './spotifyFetch'
import { Playback, State } from 'types'

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

	// player.connect()
}

export default function* () {
	yield* fork(watchPlayback)
}

const initialTimeout = 3000

function* watchPlayback() {
	let timeout = initialTimeout
	while (true) {
		try {
			const body: SpotifyApi.CurrentPlaybackResponse = yield* call(spotifyFetch, 'me/player')
			if (body) {
				const action = Actions.updatePlayback(body as Playback)
				yield* call(watchSongSkips, action)
				yield* put(action)
				timeout = initialTimeout
			}
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

function* watchSongSkips(action: Action<'PLAYBACK_UPDATED'>) {
	const Old = yield* select((s: State) => s.playback.nowPlaying)
	const New = action.payload

	if (Old && New.item.id !== Old.item.id) {
		const percent = ((Old.progress_ms || 0) / Old.item.duration_ms) * 100

		const { item: song, context } = Old

		if (percent < 80) {
			yield put(Actions.songSkipped(song, context))
		}
		if (percent < 95) {
			yield* put(
				Actions.createNotification({
					message: `${song.name} skipped ${percent.toFixed(0)}% in`,
					duration: 10000
				})
			)
		}
	}
}
