import { Action } from '~/actions'
import { User } from '~/types'

function settings (state: User['settings'], action: Action): User['settings'] {
	switch (action.type) {
		case 'USER_SETTINGS_UPDATE':
			return {
				...state,
				[action.meta]: action.payload
			}
		default:
			return state
	}
}

export default function user (state: User | null = null, action: Action): User | null {
	switch (action.type) {
		case 'USER_LOADED':
			return {
				...action.payload,
				settings: action.payload.settings ?? state?.settings ?? { minSkips: 0, watchSkips: true }
			}
		case 'USER_LOGOUT':
			return null
		case 'USER_SETTINGS_UPDATE':
			if (!state) return state
			return {
				...state,
				settings: settings(state.settings, action)
			}

		default:
			return state
	}
}
