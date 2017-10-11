import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import spotifyApi from './spotifyFetch'

import { Actions } from '../actions'
import { Track } from '../types'

export default function * watchUser () {
	yield takeLatest(Actions.tokenAquired.type, getUserDetails)
	yield takeEvery(Actions.loadUser.type, loadUser)
	yield takeEvery(Actions.fetchPlaylists.type, getPlaylists),
	yield takeEvery(Actions.fetchTracks.type, getTracks)
}

function* getUserDetails (action: typeof Actions.tokenAquired) {
	const token = action.payload

	try {
		const body: SpotifyApi.UserObjectPublic = yield call(spotifyApi, 'me', {}, token)
		const user = { name: body.id, image: body.images[0].url, token }
		yield put(Actions.userLoaded(user))
		localStorage.setItem('token', token)
		yield put(Actions.fetchPlaylists())
	} catch (e) {
		// tslint:disable-next-line:no-empty
	}
}

function* loadUser (action: typeof Actions.loadUser) {
	const token = localStorage.getItem('token')
	if (token)
		yield put(Actions.tokenAquired(token))
}

function* getPlaylists () {
	let playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items'] = []
	let response: SpotifyApi.ListOfCurrentUsersPlaylistsResponse
	const limit = 50
	let offset = 0
	do {
		response = yield call(spotifyApi, `me/playlists?offset=${offset}&limit=${limit}`)
		playlists = playlists.concat(response.items)
		offset += limit
	} while (response.next !== null)
	yield put(Actions.playlistsFetched(playlists))
}

function* getTracks (action: typeof Actions.fetchTracks) {
	const { owner, id } = action.payload
	let tracks: Track[] = []
	let response: SpotifyApi.PlaylistTrackResponse
	const limit = 100
	let offset = 0
	do {
		response = yield call(spotifyApi, `users/${owner}/playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
		const mappedTracks = response.items.map<Track>(t => ({
			...t.track,
			meta: {
				added_at: t.added_at,
				added_by: t.added_by,
				is_local: t.is_local
			}
		}))
		tracks = tracks.concat(mappedTracks)
		offset += limit
	} while (response.next !== null)
	yield put(Actions.tracksFetched(tracks, id))
}
