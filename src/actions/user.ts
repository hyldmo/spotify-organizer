import { Optional, User } from '../types'
import { makeActionCreator } from '../utils/actionCreator'

export default {
	tokenAquired: makeActionCreator<string, string | null>()('TOKEN_AQUIRED'),
	loadUser: makeActionCreator()('LOAD_USER'),
	userLoaded: makeActionCreator<Optional<User, 'settings'>>()('USER_LOADED'),
	logout: makeActionCreator()('USER_LOGOUT'),
	updateSettings: makeActionCreator<any, keyof User['settings']>()('USER_SETTINGS_UPDATE')
}
