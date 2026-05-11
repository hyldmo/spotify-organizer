import { signInAnonymously } from 'firebase/auth'
import { replace } from 'redux-first-history'
import { call, put, takeLatest } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { clearTokens, exchangeCodeForToken, refreshAccessToken, storeTokens } from '~/utils/spotifyAuth'
import { auth } from '../utils/firebase'
import { spotifyFetch } from './spotifyFetch'

export function* loginSaga () {
	yield* takeLatest(Actions.codeReceived.type, exchangeCode)
	yield* takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield* takeLatest('LOAD_USER', loadUser)
	yield* takeLatest(Actions.logout.type, onLogout)
}

function* exchangeCode (action: Action<typeof Actions.codeReceived.type>) {
	try {
		const tokens = yield* call(exchangeCodeForToken, action.payload)
		storeTokens(tokens)
		yield* put(Actions.tokenAquired(tokens.access_token, action.meta))
	} catch (e) {
		console.error(`${exchangeCode.name}:`, e)
		yield* put(
			Actions.createNotification({ message: `Login failed: ${(e as Error).message}`, type: 'warning' })
		)
	}
}

function* getUserDetails (action: Action<typeof Actions.tokenAquired.type>) {
	const token = action.payload

	try {
		const body = yield* call(() => spotifyFetch<SpotifyApi.UserObjectPublic>('me', {}, token))
		if (body) {
			const firebaseUser = yield* call(signInAnonymously, auth)

			yield* put(
				Actions.userLoaded({
					...firebaseUser.user,
					name: body.display_name || null,
					spotifyToken: token,
					spotify: {
						...body,
						image: body.images ? body.images[0].url : null
					}
				})
			)
		}
		yield* put(Actions.fetchPlaylists())
		const redirect = action.meta
		if (redirect && redirect !== location.pathname) {
			console.info(`Redirecting to ${redirect} from ${location.pathname}`)
			yield* put(replace({ pathname: redirect, search: '?redirected=true' }))
		}
	} catch (e) {
		console.error(`${getUserDetails.name}:`, e)
		yield put(
			Actions.createNotification({ message: `${getUserDetails.name}: ${(e as Error).message}`, type: 'warning' })
		)
	}
}

function* loadUser (_: Action<typeof Actions.loadUser.type>) {
	const token = localStorage.getItem('token')
	const refreshToken = localStorage.getItem('refresh_token')

	if (token) {
		yield* call(signInAnonymously, auth)
		yield* put(Actions.tokenAquired(token, null))
	} else if (refreshToken) {
		try {
			const tokens = yield* call(refreshAccessToken, refreshToken)
			storeTokens(tokens)
			yield* call(signInAnonymously, auth)
			yield* put(Actions.tokenAquired(tokens.access_token, null))
		} catch (e) {
			console.warn('Failed to refresh token on load:', e)
			clearTokens()
		}
	}
}

function* onLogout (_: Action<typeof Actions.logout.type>) {
	yield* call(clearTokens)
}
