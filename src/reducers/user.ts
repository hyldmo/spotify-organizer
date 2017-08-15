import { Action } from '../actions'

export type User = {
	name: string
	image: string
	token: string
}

export default function user (state: User = null, action: Action): User {
	switch (action.type) {
		case 'USER_LOADED':
			return action.payload
		default:
			return state
	}
}

