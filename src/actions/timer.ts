import { makeActionCreator } from '~/utils/actionCreator'

export default {
	startTimer: makeActionCreator<number>()('TIMER_START'),
	updateTimer: makeActionCreator<number>()('TIMER_UPDATE')
}
