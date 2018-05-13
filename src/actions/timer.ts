import { createAction } from './actionCreator'

export default {
	startTimer: createAction<'TIMER_START', number>('TIMER_START'),
	updateTimer: createAction<'TIMER_UPDATE', number>('TIMER_UPDATE')
}
