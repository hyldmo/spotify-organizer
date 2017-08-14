import { Action } from '../actions'

export default function version (state: string = '', action: Action) {
	switch (action.type) {
		case 'LOGIN':
			return action.payload
		default:
			return state
	}
}

