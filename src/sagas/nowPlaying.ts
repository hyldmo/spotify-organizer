import { Action, Actions } from '../actions'
import { call, cancelled, fork, put, select } from 'typed-redux-saga'
import { firebaseGet, firebaseUpdate, sleep } from 'utils'
import { spotifyFetch } from './spotifyFetch'
import { FirebaseUrls, Playback, SongEntry, State, User } from 'types'

export default function* () {
	yield* fork(watchPlayback)
}

function* watchPlayback() {
	const initialTimeout = 3000

	let timeout = initialTimeout
	while (true) {
		try {
			const body: SpotifyApi.CurrentPlaybackResponse | null = yield* call(spotifyFetch, 'me/player')
			if (body) {
				const action = Actions.updatePlayback(body as Playback)
				yield* call(onPlaybackUpdated, action)
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

function* onPlaybackUpdated(action: Action<'PLAYBACK_UPDATED'>) {
	const current = yield* select((s: State) => s.playback.nowPlaying)
	const user = yield* select((s: State) => s.user as User) // User will not be null when playback is active

	if (current && action.payload.item.id !== current.item.id) {
		const { item: song, context, progress_ms } = current
		const percent = ((progress_ms || 0) / song.duration_ms) * 100

		const entry = (yield* call(
			firebaseGet,
			`users/${user.id}/songs/${song.id}/${context?.uri || 'unknown'}/`
		)) as SongEntry | null

		const updatePlaysId: FirebaseUrls = `users/${user.id}/plays/${context?.uri || 'unknown'}/${song.id}/`
		yield* call(firebaseUpdate, updatePlaysId, (entry?.plays || 0) + 1)

		if (percent < 80) {
			yield put(Actions.songSkipped(song, context))

			const updateSkipsId: FirebaseUrls = `users/${user.id}/skips/${context?.uri || 'unknown'}/${song.id}/`
			yield* call(firebaseUpdate, updateSkipsId, (entry?.skips || 0) + 1)
		}
		if (percent < 90) {
			yield* put(
				Actions.createNotification({
					message: `${song.name} skipped ${percent.toFixed(0)}% in`,
					duration: 10000
				})
			)
		}
	}
}
