import { call, put, takeLatest } from 'redux-saga/effects'
import { Actions } from '../actions'
import { sleep } from '../utils/sleep'

export default function* () {
	yield takeLatest<typeof Actions.startTimer>(Actions.startTimer(0).type, startTimer)
}

function* startTimer (action: typeof Actions.startTimer) {
	let time = action.payload
	while (time > 0) {
		yield call(sleep, 1000)
		yield put(Actions.updateTimer(--time))
	}
}
