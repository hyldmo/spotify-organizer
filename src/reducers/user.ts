import { Action } from '../actions'
import { User } from '../types'

export default function user (state: User = null, action: Action): User {
	switch (action.type) {
		case 'USER_LOADED':
			return action.payload
		case 'USER_LOGOUT':
			return null
		default:
			return state
	}
}

