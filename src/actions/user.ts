import { Optional, User } from '~/types'
import { makeActionCreator } from '~/utils/actionCreator'

export default {
	codeReceived: makeActionCreator<string, string | null>()('CODE_RECEIVED'),
	tokenAquired: makeActionCreator<string, string | null>()('TOKEN_AQUIRED'),
	tokenRefreshed: makeActionCreator<string>()('TOKEN_REFRESHED'),
	loadUser: makeActionCreator()('LOAD_USER'),
	userLoaded: makeActionCreator<Optional<User, 'settings'>>()('USER_LOADED'),
	logout: makeActionCreator()('USER_LOGOUT'),
	updateSettings: makeActionCreator<any, keyof User['settings']>()('USER_SETTINGS_UPDATE'),
	authCheckStart: makeActionCreator()('AUTH_CHECK_START'),
	authCheckDone: makeActionCreator()('AUTH_CHECK_DONE')
}
