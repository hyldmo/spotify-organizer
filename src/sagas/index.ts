import { Store } from 'redux'
import { SagaMiddleware } from 'redux-saga'
import { call, cancel, delay, fork, take } from 'typed-redux-saga'
import { State } from '~/types'
import loginSaga from './login'
import notificationsSaga from './notifications'
import nowPlayingSaga from './nowPlaying'
import playlistsSaga from './playlists'
import timer from './timer'
import tracksSaga from './tracks'

const sagas = [loginSaga, nowPlayingSaga, notificationsSaga, tracksSaga, playlistsSaga, timer]

export const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR'

function makeRestartable (saga: any) {
	return function* () {
		while (true) {
			try {
				yield* call(saga)
				break
			} catch (e) {
				console.warn(`Saga '${saga.name}' failed.`, e)
			}
			yield* delay(1000)
		}
	}
}

// TODO: Add proper typing
function createAbortableSaga (saga: any) {
	if (process.env.NODE_ENV === 'development') {
		return function* main () {
			const sagaTask = yield* fork(saga)

			yield* take(CANCEL_SAGAS_HMR)
			yield* cancel(sagaTask)
		}
	} else {
		return saga
	}
}

const SagaManager = {
	startSagas (sagaMiddleware: SagaMiddleware<any>) {
		sagas
			.map(makeRestartable)
			.map(createAbortableSaga)
			.forEach(saga => sagaMiddleware.run(saga))
	},

	cancelSagas (store: Store<State>) {
		store.dispatch({
			type: CANCEL_SAGAS_HMR
		})
	}
}

export default SagaManager
