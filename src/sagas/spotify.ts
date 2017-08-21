import { call, select } from 'redux-saga/effects'

import { State } from '../reducers'

export default function* spotifyFetch (url: string, options: RequestInit = {}, apiToken: string | undefined) {
	const token = apiToken !== undefined ? apiToken : yield select((state: State) => state.user.token)

	const headers = new Headers()
	headers.append('Authorization', `Bearer ${token}`)
	const response: Response = yield call<RequestInfo, RequestInit>(fetch, 'https://api.spotify.com/v1/' + url, { headers, ...options })
	const body = yield response.json()
	if (!response.ok)
		throw new Error(body.error.message)
	return body
}
