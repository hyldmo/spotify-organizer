import { Action } from '../actions'

export default function user(state = 0, action: Action): number {
	switch (action.type) {
		case 'TIMER_START':
		case 'TIMER_UPDATE':
			return action.payload
		default:
			return state
	}
}
