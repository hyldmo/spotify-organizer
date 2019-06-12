import { SagaIterator } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'

import { Actions } from '../actions'
import { State } from '../reducers'
import { sleep } from '../utils'

// TODO: Remove any
export default function* spotifyFetch (url: string, options: RequestInit = {}, apiToken?: string): SagaIterator | any {
	const token = apiToken !== undefined
		? apiToken
		: yield select((state: State) => state.user && state.user.token)

	const headers = new Headers({
		Authorization: `Bearer ${token}`
	})
	const response: Response = yield call(fetch, `https://api.spotify.com/v1/${url}`, { headers, ...options })
	const body = yield response.json()

	switch (response.status) {
		case 200:
		case 304:
			return body
		case 401:
			yield put(Actions.logout())
			// window.open(loginLink(), '_self')
			break
		case 429: {
			const waitTime = Number.parseInt(response.headers.get('Retry-After') || '10', 10)
			yield put(Actions.startTimer(waitTime))
			yield call(sleep, waitTime * 1000)
			return yield call(spotifyFetch, url, options, token)
		}
		default:
			throw new Error(body.error.message)
	}
}
