import { replace } from 'redux-first-history'
import { call, fork, put, takeLatest } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { ensureFirebaseReady, migrateLegacyUidData, resetFirebaseAuth, setSpotifyId } from '~/utils/firebase'
import { parseQueryString } from '~/utils/parseQueryString'
import {
	clearTokens,
	exchangeCodeForToken,
	finishReauth,
	reauthenticate,
	reauthInProgress,
	refreshAccessToken,
	RefreshTokenRejected,
	storeTokens
} from '~/utils/spotifyAuth'
import { spotifyFetch } from './spotifyFetch'

export function* loginSaga () {
	yield* takeLatest(Actions.codeReceived.type, exchangeCode)
	yield* takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield* takeLatest('LOAD_USER', loadUser)
	yield* takeLatest(Actions.logout.type, onLogout)
}

function* exchangeCode (action: Action<typeof Actions.codeReceived.type>) {
	yield* put(Actions.authCheckStart())
	try {
		const tokens = yield* call(exchangeCodeForToken, action.payload)
		storeTokens(tokens)
		finishReauth()
		yield* put(Actions.tokenAquired(tokens.access_token, action.meta))
	} catch (e) {
		console.error(`${exchangeCode.name}:`, e)
		yield* put(Actions.authCheckDone())
		yield* put(Actions.createNotification({ message: `Login failed: ${(e as Error).message}`, type: 'warning' }))
	}
}

function* getUserDetails (action: Action<typeof Actions.tokenAquired.type>) {
	const token = action.payload

	try {
		const body = yield* call(() => spotifyFetch<SpotifyApi.UserObjectPublic>('me', {}, token))
		if (body) {
			// spotifyFetch may have refreshed the access token during /me — read
			// the freshest token back from localStorage so we don't seed the
			// store with an already-expired one.
			const spotifyToken = localStorage.getItem('token') || token
			// Register the Spotify id with the firebase layer BEFORE the user
			// is published — useFirebase hooks fire as soon as React re-renders
			// with a non-null user, and they need the mapping to be in flight.
			yield* call(setSpotifyId, body.id)
			yield* put(
				Actions.userLoaded({
					uid: body.id,
					name: body.display_name || null,
					spotifyToken,
					spotify: {
						...body,
						image: body.images?.[0]?.url ?? null
					}
				})
			)
			yield* fork(firebaseAuthBackground, body.id)
			yield* put(Actions.fetchPlaylists())
		}
		const redirect = action.meta
		if (redirect && redirect !== location.pathname) {
			console.info(`Redirecting to ${redirect} from ${location.pathname}`)
			yield* put(replace({ pathname: redirect, search: '?redirected=true' }))
		}
	} catch (e) {
		console.error(`${getUserDetails.name}:`, e)
		yield* put(
			Actions.createNotification({ message: `${getUserDetails.name}: ${(e as Error).message}`, type: 'warning' })
		)
	} finally {
		yield* put(Actions.authCheckDone())
	}
}

function* firebaseAuthBackground (spotifyId: string) {
	const fbUid = yield* call(ensureFirebaseReady)
	if (!fbUid) return
	// Salvage anything this anon uid previously wrote at users/<fbUid>/...
	yield* call(migrateLegacyUidData, spotifyId)
}

function* loadUser (_: Action<typeof Actions.loadUser.type>) {
	// A `?code=` in the URL means we've just come back from Spotify's authorize
	// endpoint (either a manual login or a silent re-auth bounce). Handle it here
	// at bootstrap so it works regardless of which view is mounted — a stale
	// persisted user can otherwise keep <Auth> from ever rendering.
	if (location.search.includes('code=')) {
		const query = parseQueryString(location.href, false)
		history.replaceState({}, '', location.pathname)
		yield* put(Actions.codeReceived(query.code, query.state || null))
		return
	}

	const token = localStorage.getItem('token')
	const refreshToken = localStorage.getItem('refresh_token')

	if (token) {
		// authCheckDone is dispatched by the resulting getUserDetails
		yield* put(Actions.tokenAquired(token, null))
		return
	}
	if (refreshToken) {
		try {
			const tokens = yield* call(refreshAccessToken, refreshToken)
			storeTokens(tokens)
			yield* put(Actions.tokenAquired(tokens.access_token, null))
			return
		} catch (e) {
			console.warn('Failed to refresh token on load:', e)
			// Transient errors (network, Spotify 5xx) keep the token so a later
			// load retries. A real rejection means the refresh token is dead —
			// try a silent re-auth bounce before giving up on the session.
			if (e instanceof RefreshTokenRejected) {
				if (reauthInProgress()) {
					clearTokens()
				} else {
					yield* call(reauthenticate) // navigates away
					return
				}
			}
		}
	}
	yield* put(Actions.authCheckDone())
}

function* onLogout (_: Action<typeof Actions.logout.type>) {
	yield* call(clearTokens)
	yield* call(resetFirebaseAuth)
}
