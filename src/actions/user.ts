import { User } from '../types'
import { makeActionCreator } from '../utils/actionCreator'

export default {
	tokenAquired: makeActionCreator<string, string | null>()('TOKEN_AQUIRED'),
	loadUser: makeActionCreator()('LOAD_USER'),
	userLoaded: makeActionCreator<User>()('USER_LOADED'),
	logout: makeActionCreator()('USER_LOGOUT')
}
