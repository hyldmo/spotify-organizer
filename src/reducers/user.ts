import { Action } from '../actions'
import { User } from '../types'

export default function user (state: User | null = null, action: Action): User | null {
	switch (action.type) {
		case 'USER_LOADED':
			return action.payload
		case 'USER_LOGOUT':
			return null
		default:
			return state
	}
}

