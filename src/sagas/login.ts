import { signInAnonymously } from 'firebase/auth'
import { replace } from 'redux-first-history'
import { call, put, takeLatest } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { auth } from '../utils/firebase'
import { spotifyFetch } from './spotifyFetch'

export function* loginSaga () {
	yield* takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield* takeLatest('LOAD_USER', loadUser)
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
					image: body.images ? body.images[0].url : null,
					token,
					spotify: body
				})
			)
		}
		localStorage.setItem('token', token)
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
	if (token) {
		yield* call(signInAnonymously, auth)
		yield* put(Actions.tokenAquired(token, null))
	}
}
