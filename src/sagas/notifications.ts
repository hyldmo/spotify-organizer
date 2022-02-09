import { call, put, takeEvery } from 'typed-redux-saga'
import { Action, Actions } from '../actions'
import { sleep } from '../utils'

export default function* () {
	yield* takeEvery(Actions.createNotification.type, createNotification)
}

let id = 0

function* createNotification(action: Action<typeof Actions.createNotification.type>) {
	const notification = {
		...action.payload,
		id: id++
	}
	if (action.payload.progress) return
	yield* put(Actions.__notificationCreated(notification))
	yield* call(sleep, action.payload.duration || 5000)
	yield* put(Actions.clearNotification(notification.id))
}
