import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import { Actions } from '../actions'

export default function * watchUser () {
	yield takeEvery(Actions.tokenAquired.type, getUserDetails)
	yield takeEvery(Actions.loadUser.type, loadUser)
}

function* getUserDetails (action: typeof Actions.tokenAquired) {
	const token = action.payload
	const headers = new Headers()
	headers.append('Authorization', `Bearer ${token}`)

	const response = yield call<RequestInfo, RequestInit>(fetch, 'https://api.spotify.com/v1/me', { headers })
	const body = yield response.json()

	const user = { name: body.id, image: body.images[0].url, token }
	yield put(Actions.userLoaded(user))
	localStorage.setItem('token', action.payload)
}

function* loadUser (action: typeof Actions.loadUser) {
	const token = localStorage.getItem('token')
	yield put(Actions.tokenAquired(token))
}
