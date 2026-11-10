import { call, put, takeEvery, takeLatest } from 'typed-redux-saga'
import { type Action, Actions } from '~/actions'
import { api } from '~/utils/api'

export function* statsSaga() {
	yield* takeLatest('USER_LOADED', loadStats)
	yield* takeEvery('STATS_RECORDED', recordStat)
	yield* takeEvery('PLAYBACK_CLEAR_SKIPS', clearSkips)
}

function* loadStats() {
	try {
		const stats = yield* call(() => api.stats.all.query())
		yield* put(Actions.statsLoaded(stats))
	} catch (e) {
		console.warn(`${loadStats.name}:`, e)
	}
}

// The reducer has already counted it. A failed write loses one count, which isn't worth retrying.
function* recordStat(action: Action<'STATS_RECORDED'>) {
	try {
		yield* call(() => api.stats.record.mutate(action.payload))
	} catch (e) {
		console.warn(`${recordStat.name}:`, e)
	}
}

function* clearSkips(action: Action<'PLAYBACK_CLEAR_SKIPS'>) {
	try {
		yield* call(() => api.stats.clearSkips.mutate({ contextUri: action.meta, trackId: action.payload }))
	} catch (e) {
		console.warn(`${clearSkips.name}:`, e)
	}
}
