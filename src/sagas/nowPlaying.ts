import { call, cancelled, fork, put, select, take, takeEvery } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { Playback, State, User } from '~/types'
import { firebaseGet, firebaseUpdate, sleep } from '~/utils'
import { spotifyFetch } from './spotifyFetch'

export function* nowPlayingSaga () {
	yield* takeEvery('PLAYBACK_CLEAR_SKIPS', clearSkips)
	yield* takeEvery('PLAYBACK_CONTROL', playbackControl)
	yield* take('TOKEN_AQUIRED')
	yield* fork(watchPlayback)
}

function* clearSkips (action: Action<'PLAYBACK_CLEAR_SKIPS'>) {
	const user = yield* select((s: State) => s.user as User) // User will not be null when playback is active
	yield* call(() => firebaseUpdate(`users/${user.uid}/skips/${action.meta}/${action.payload}/`, 0))
}

function* playbackControl (action: Action<'PLAYBACK_CONTROL'>) {
	const playback = yield* select((s: State) => s.playback.nowPlaying)
	if (!playback) return

	try {
		switch (action.payload) {
			case 'play':
				yield* call(() => spotifyFetch('me/player/play', { method: 'PUT' }))
				break
			case 'pause':
				yield* call(() => spotifyFetch('me/player/pause', { method: 'PUT' }))
				break
			case 'next':
				yield* call(() => spotifyFetch('me/player/next', { method: 'POST' }))
				break
			case 'previous':
				yield* call(() => spotifyFetch('me/player/previous', { method: 'POST' }))
				break
			case 'shuffle':
				yield* call(() => spotifyFetch(`me/player/shuffle?state=${!playback.shuffle_state}`, { method: 'PUT' }))
				break
			case 'repeat': {
				const states = ['off', 'context', 'track'] as const
				const currentIndex = states.indexOf(playback.repeat_state as typeof states[number])
				const nextState = states[(currentIndex + 1) % states.length]
				yield* call(() => spotifyFetch(`me/player/repeat?state=${nextState}`, { method: 'PUT' }))
				break
			}
		}
	} catch (e) {
		yield* put(Actions.createNotification({ message: (e as Error).message, type: 'error' }))
	}
}

function* watchPlayback () {
	const initialTimeout = 3000

	let timeout = initialTimeout
	while (true) {
		try {
			const body = yield* call(() => spotifyFetch<SpotifyApi.CurrentPlaybackResponse>('me/player'))
			if (body) {
				const action = Actions.updatePlayback(body as Playback)
				yield* put(action)
				try {
					yield* call(onPlaybackUpdated, action)
				} catch (e) {
					console.warn(`${onPlaybackUpdated.name}:`, e)
				}
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

function* onPlaybackUpdated (action: Action<'PLAYBACK_UPDATED'>) {
	const current = yield* select((s: State) => s.playback.nowPlaying)
	const user = yield* select((s: State) => s.user as User) // User will not be null when playback is active

	if (!current || action.payload.item.id === current.item.id) return

	const { item: song, context } = current
	const progress_ms = current.progress_ms ?? 0
	const percent = (progress_ms / song.duration_ms) * 100

	const plays = yield* call(() => firebaseGet(`users/${user.uid}/plays/${context?.uri || 'unknown'}/${song.id}/`))

	yield* call(() =>
		firebaseUpdate(`users/${user.uid}/plays/${context?.uri || 'unknown'}/${song.id}/`, (plays ?? 0) + 1)
	)

	if (user.settings.watchSkips) {
		// Detect skip based on seconds left in song and percent completed
		if (song.duration_ms - progress_ms > 10000 && percent < 80) {
			yield put(Actions.songSkipped(song, context))

			const skips = yield* call(() =>
				firebaseGet(`users/${user.uid}/skips/${context?.uri || 'unknown'}/${song.id}/`)
			)
			yield* call(() =>
				firebaseUpdate(`users/${user.uid}/skips/${context?.uri || 'unknown'}/${song.id}/`, (skips ?? 0) + 1)
			)
		}
		if (percent < 90) {
			yield* put(
				Actions.createNotification({
					message: `${song.name} skipped ${percent.toFixed(0)}% in`,
					duration: 10000,
					type: 'info'
				})
			)
		}
	}
}
