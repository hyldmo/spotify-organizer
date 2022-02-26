import { Action } from '~/actions'
import { Notification } from '~/types'

type State = Notification[]

export default function (state: State = [], action: Action): State {
	switch (action.type) {
		case 'CREATE_NOTIFICATION_SUCCESS':
			return [...state, action.payload]

		case 'CLEAR_NOTIFICATION':
			return state.filter(notification => notification.id !== action.meta)

		case 'CLEAR_ALL_NOTIFICATIONS':
			return []

		default:
			return state
	}
}
