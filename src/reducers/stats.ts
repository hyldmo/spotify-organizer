import type { Action } from '~/actions'
import type { StatCounters, TrackStats } from '~/types'

export interface StatsState extends TrackStats {
	loaded: boolean
}

const initialState: StatsState = { plays: {}, skips: {}, loaded: false }

function withCount(counters: StatCounters, contextUri: string, trackId: string, count: (n: number) => number) {
	const context = counters[contextUri] ?? {}
	return { ...counters, [contextUri]: { ...context, [trackId]: count(context[trackId] ?? 0) } }
}

export default function stats(state = initialState, action: Action): StatsState {
	switch (action.type) {
		case 'STATS_LOADED':
			return { ...action.payload, loaded: true }
		case 'STATS_RECORDED': {
			const { kind, contextUri, trackId } = action.payload
			const key = kind === 'play' ? 'plays' : 'skips'
			return { ...state, [key]: withCount(state[key], contextUri, trackId, n => n + 1) }
		}
		case 'PLAYBACK_CLEAR_SKIPS':
			return { ...state, skips: withCount(state.skips, action.meta, action.payload, () => 0) }
		case 'USER_LOGOUT':
			return initialState
		default:
			return state
	}
}
