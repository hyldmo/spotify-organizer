import { replace } from 'redux-first-history'
import { call, put, takeLatest } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { spotifyFetch } from './spotifyFetch'

export default function* () {
	yield* takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield* takeLatest('LOAD_USER', loadUser)
}

function* getUserDetails (action: Action<typeof Actions.tokenAquired.type>) {
	const token = action.payload

	try {
		const body = yield* call(() => spotifyFetch<SpotifyApi.UserObjectPublic>('me', {}, token))
		if (body)
			yield* put(
				Actions.userLoaded({
					...body,
					name: body.display_name || null,
					image: body.images ? body.images[0].url : null,
					token
				})
			)
		localStorage.setItem('token', token)
		yield* put(Actions.fetchPlaylists())
		const redirect = action.meta
		if (redirect) yield* put(replace({ pathname: redirect }))
	} catch (e) {
		console.error(`${getUserDetails.name}:`, e)
		yield put(
			Actions.createNotification({ message: `${getUserDetails.name}: ${(e as Error).message}`, type: 'warning' })
		)
	}
}

function* loadUser (_: Action<typeof Actions.loadUser.type>) {
	const token = localStorage.getItem('token')
	if (token) yield* put(Actions.tokenAquired(token, null))
}
