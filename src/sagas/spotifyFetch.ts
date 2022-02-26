import { SagaIterator } from 'redux-saga'
import { call, put, select } from 'typed-redux-saga'
import { Actions } from '~/actions'
import { loginLink } from '~/consts'
import { State } from '~/types'
import { sleep } from '~/utils'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function* spotifyFetch<T extends unknown>(
	url: string,
	options: RequestInit = {},
	apiToken?: string
): SagaIterator<any | null> {
	const userToken = yield* select((state: State) => state.user && state.user.token)
	const token = apiToken || userToken || localStorage.getItem('token')

	if (!token) {
		throw new Error(`${spotifyFetch.name}:Token not found`)
	}

	const headers = new Headers({ Authorization: `Bearer ${token}` })
	const response: Response = yield* call(fetch, `https://api.spotify.com/v1/${url}`, { headers, ...options })
	let body = null
	if (response.status !== 204) {
		body = yield* call(response.json.bind(response))
	}

	switch (response.status) {
		case 200:
		case 304:
			return body as T

		case 204:
			return null

		case 401:
			yield* put(Actions.logout())
			setTimeout(() => window.open(loginLink(), '_self'), 5000)
			break
		case 429: {
			const waitTime = Number.parseInt(response.headers.get('Retry-After') || '10', 10)
			yield* put(Actions.startTimer(waitTime))
			yield* call(sleep, waitTime * 1000)
			const next = yield* call(spotifyFetch, url, options, token)
			return next as T | null
		}
		default:
			throw new Error(body.error.message)
	}
	return null
}
