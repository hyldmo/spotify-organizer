import { call, put, takeEvery } from 'typed-redux-saga'
import { Action, Actions } from '../actions'
import { sleep } from '../utils'

export default function* () {
	yield* takeEvery(Actions.createNotification.type, createNotification)
}

let ID = 0

function* createNotification(action: Action<typeof Actions.createNotification.type>) {
	const { id = ID++, duration = 5000, type = 'success', ...payload } = action.payload

	const notification = { ...payload, id, duration, type }
	if (notification.progress) return
	yield* put(Actions.__notificationCreated(notification))
	yield* call(sleep, notification.duration)
	yield* put(Actions.clearNotification(notification.id))
}
