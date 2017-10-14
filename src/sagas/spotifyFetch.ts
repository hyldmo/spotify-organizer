
import { SagaIterator } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'

import { Actions } from '../actions/'
import { State } from '../reducers'


// TODO: Remove any
export default function* spotifyFetch (url: string, options: RequestInit = {}, apiToken?: string): SagaIterator | any {
	const token = apiToken !== undefined
		? apiToken
		: yield select((state: State) => state.user.token)

	const headers = new Headers()
	headers.append('Authorization', `Bearer ${token}`)
	const response: Response = yield call(fetch, `https://api.spotify.com/v1/${url}`, { headers, ...options })
	const body = yield response.json()

	switch (response.status) {
		case 200:
		case 302:
			return body
		case 401:
			yield put(Actions.logout())
			// window.open(loginLink(), '_self')
			break
		default:
			throw new Error(body.error.message)
	}
}
