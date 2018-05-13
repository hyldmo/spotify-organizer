import { replace } from 'react-router-redux'
import { call, put, takeLatest } from 'redux-saga/effects'
import { Actions } from '../actions'
import spotifyApi from './spotifyFetch'

export default function * watchUser () {
	yield takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield takeLatest(Actions.loadUser.type, loadUser)
}

function* getUserDetails (action: typeof Actions.tokenAquired) {
	const token = action.payload
	const redirect = action.meta

	try {
		const body: SpotifyApi.UserObjectPublic = yield call(spotifyApi, 'me', {}, token)
		const user = { name: body.id, image: body.images ? body.images[0].url : null, token }
		yield put(Actions.userLoaded(user))
		localStorage.setItem('token', token)
		yield put(Actions.fetchPlaylists())
		if (redirect)
			yield put(replace(redirect))
	} catch (e) {
		// tslint:disable-next-line:no-empty
	}
}

function* loadUser (action: typeof Actions.loadUser) {
	const token = localStorage.getItem('token')
	if (token)
		yield put(Actions.tokenAquired(token, null))
}
