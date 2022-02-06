import { SagaIterator } from 'redux-saga'
import { call, put, select } from 'typed-redux-saga'
import { Actions } from '../actions'
import { State } from '../types'
import { sleep } from '../utils'

// TODO: Remove any
export function* spotifyFetch(url: string, options: RequestInit = {}, apiToken?: string): SagaIterator {
	const token = apiToken !== undefined ? apiToken : yield* select((state: State) => state.user && state.user.token)
	if (!token) {
		console.info(`${spotifyFetch.name}:Token not found`)
		return
	}

	const headers = new Headers({ Authorization: `Bearer ${token}` })
	const response: Response = yield* call(fetch, `https://api.spotify.com/v1/${url}`, { headers, ...options })
	const body = yield* call(response.json.bind(response))

	switch (response.status) {
		case 200:
		case 304:
			return body

		case 401:
			yield* put(Actions.logout())
			// window.open(loginLink(), '_self')
			break
		case 429: {
			const waitTime = Number.parseInt(response.headers.get('Retry-After') || '10', 10)
			yield* put(Actions.startTimer(waitTime))
			yield* call(sleep, waitTime * 1000)
			return yield* call(spotifyFetch, url, options, token)
		}
		default:
			throw new Error(body.error.message)
	}
}
