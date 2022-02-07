import { replace } from 'redux-first-history'
import { call, put, takeLatest } from 'typed-redux-saga'
import { User } from 'types'
import { Action, Actions } from '../actions'
import { spotifyFetch } from './spotifyFetch'

export default function* () {
	yield* takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield* takeLatest('LOAD_USER', loadUser)
}

function* getUserDetails(action: Action<typeof Actions.tokenAquired.type>) {
	const token = action.payload

	try {
		const body: SpotifyApi.UserObjectPublic = yield* call(spotifyFetch, 'me', {}, token)
		const user: User = {
			...body,
			name: body.display_name || null,
			image: body.images ? body.images[0].url : null,
			token
		}
		yield* put(Actions.userLoaded(user))
		localStorage.setItem('token', token)
		yield* put(Actions.fetchPlaylists())
		const redirect = action.meta
		if (redirect) yield* put(replace({ pathname: redirect }))
	} catch (e) {
		console.error(`${getUserDetails.name}:`, e)
	}
}

function* loadUser(_: Action<typeof Actions.loadUser.type>) {
	const token = localStorage.getItem('token')
	if (token) yield* put(Actions.tokenAquired(token, null))
}
