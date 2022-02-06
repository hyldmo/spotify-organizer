import { call, put, takeEvery } from 'typed-redux-saga'
import { Action, Actions } from '../actions'
import { sleep } from '../utils'

export default function* () {
	yield* takeEvery(Actions.createNotification.type, createNotification)
}

function* createNotification(action: Action<typeof Actions.createNotification.type>) {
	if (action.payload.progress) return
	yield* call(sleep, action.payload.duration || 2000)
	yield* put(Actions.clearNotification())
}
