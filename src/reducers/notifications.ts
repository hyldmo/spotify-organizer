import { Action } from '../actions'
import { Notification } from '../types'

type State = Notification | null

export default function (state: State = null, action: Action): State {
	switch (action.type) {
		case 'CREATE_NOTIFICATION':
			return action.payload
		case 'CLEAR_NOTIFICATION':
			return null
		default:
			return state
	}
}
