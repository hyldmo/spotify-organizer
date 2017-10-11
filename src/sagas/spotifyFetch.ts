import { SagaIterator } from 'redux-saga'
import { call, select } from 'redux-saga/effects'

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
	if (!response.ok)
		throw new Error(body.error.message)
	return body
}
