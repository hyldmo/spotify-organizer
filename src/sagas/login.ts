import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import spotifyApi from './spotify'

import { Actions } from '../actions'

export default function * watchUser () {
	yield takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield takeEvery(Actions.loadUser.type, loadUser)
	yield takeEvery(Actions.fetchPlaylists.type, getPlaylists)
}

function* getUserDetails (action: typeof Actions.tokenAquired) {
	const token = action.payload

	try {
		const body: SpotifyApi.UserObjectPublic = yield call(spotifyApi, 'me', {}, token)
		const user = { name: body.id, image: body.images[0].url, token }
		yield put(Actions.userLoaded(user))
		localStorage.setItem('token', token)
		yield put(Actions.fetchPlaylists(token))
	} catch (e) {
		// tslint:disable-next-line:no-empty
	}
}

function* loadUser (action: typeof Actions.loadUser) {
	const token = localStorage.getItem('token')
	if (token)
		yield put(Actions.tokenAquired(token))
}

function* getPlaylists (action: typeof Actions.fetchPlaylists) {
	let playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items'] = []
	let response: SpotifyApi.ListOfCurrentUsersPlaylistsResponse
	const limit = 50
	let offset = 0
	do {
		response = yield call(spotifyApi, `me/playlists?offset=${offset}&limit=${limit}`)
		playlists = playlists.concat(response.items)
		offset += 50
	} while (response.next !== null)
	yield put(Actions.playlistsFetched(playlists))
}
