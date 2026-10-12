import type { StatEvent, TrackStats } from '~/types'
import { makeActionCreator } from '~/utils/actionCreator'

export default {
	statsLoaded: makeActionCreator<TrackStats>()('STATS_LOADED'),
	statRecorded: makeActionCreator<StatEvent>()('STATS_RECORDED')
}
