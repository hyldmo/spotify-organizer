import type { Action } from '~/actions'

export type AuthState = {
	checking: boolean
}

// Start in `checking` so the very first paint shows a spinner instead of the
// login button — Root.tsx dispatches loadUser() synchronously, which resolves
// to either authCheckDone or userLoaded shortly after.
const initialState: AuthState = { checking: true }

export default function auth(state: AuthState = initialState, action: Action): AuthState {
	switch (action.type) {
		case 'AUTH_CHECK_START':
			return { checking: true }
		case 'AUTH_CHECK_DONE':
		case 'USER_LOADED':
		case 'USER_LOGOUT':
			return { checking: false }
		default:
			return state
	}
}
