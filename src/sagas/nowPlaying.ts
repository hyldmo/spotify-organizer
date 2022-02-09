/* eslint-disable camelcase */
import { Action, Actions } from '../actions'
import { call, cancelled, fork, put, select } from 'typed-redux-saga'
import { sleep } from 'utils'
import { spotifyFetch } from './spotifyFetch'
import { Playback, State } from 'types'

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
	const current = yield* select((s: State) => s.playback.nowPlaying)

	if (current && action.payload.item.id !== current.item.id) {
		const { item: song, context, progress_ms } = current
		const percent = ((progress_ms || 0) / song.duration_ms) * 100

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
