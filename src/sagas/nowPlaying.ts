import { call, cancelled, fork, put, select, take, takeEvery } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { Playback, State, User } from '~/types'
import { firebaseGet, firebaseUpdate, sleep } from '~/utils'
import { spotifyFetch } from './spotifyFetch'

export default function* () {
	yield* takeEvery('PLAYBACK_CLEAR_SKIPS', clearSkips)
	yield* take('TOKEN_AQUIRED')
	yield* fork(watchPlayback)
}

function* clearSkips (action: Action<'PLAYBACK_CLEAR_SKIPS'>) {
	const user = yield* select((s: State) => s.user as User) // User will not be null when playback is active
	yield* call(() => firebaseUpdate(`users/${user.id}/skips/${action.meta}/${action.payload}/`, 0))
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
				yield* call(onPlaybackUpdated, action)
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

	const plays = yield* call(() => firebaseGet(`users/${user.id}/plays/${context?.uri || 'unknown'}/${song.id}/`))

	yield* call(() =>
		firebaseUpdate(`users/${user.id}/plays/${context?.uri || 'unknown'}/${song.id}/`, (plays ?? 0) + 1)
	)

	if (user.settings.watchSkips) {
		// Detect skip based on seconds left in song and percent completed
		if (song.duration_ms - progress_ms > 10000 && percent < 80) {
			yield put(Actions.songSkipped(song, context))

			const skips = yield* call(() =>
				firebaseGet(`users/${user.id}/skips/${context?.uri || 'unknown'}/${song.id}/`)
			)
			yield* call(() =>
				firebaseUpdate(`users/${user.id}/skips/${context?.uri || 'unknown'}/${song.id}/`, (skips ?? 0) + 1)
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
