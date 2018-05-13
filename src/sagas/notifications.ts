import { put, takeEvery } from 'redux-saga/effects'
import { Actions } from '../actions'
import { sleep } from '../utils'

export default function* () {
	yield takeEvery(Actions.createNotification.type, createNotification)
}

function* createNotification (action: typeof Actions.createNotification) {
	if (action.payload.progress) return
	yield sleep(action.payload.duration || 2000)
	yield put(Actions.clearNotification())
}
