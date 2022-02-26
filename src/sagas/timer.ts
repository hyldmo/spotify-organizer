import { call, put, takeLatest } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { sleep } from '~/utils/sleep'

export default function* () {
	yield takeLatest<ReturnType<typeof Actions.startTimer>>(Actions.startTimer.type, startTimer)
}

function* startTimer(action: Action<typeof Actions.startTimer.type>) {
	let time = action.payload
	while (time > 0) {
		yield call(sleep, 1000)
		yield put(Actions.updateTimer(--time))
	}
}
