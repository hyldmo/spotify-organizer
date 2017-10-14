import { User } from '../types'
import { createAction } from './actionCreator'

const UserActions = {
	tokenAquired: createAction<'TOKEN_AQUIRED', string, string | null>('TOKEN_AQUIRED'),
	loadUser: createAction<'LOAD_USER'>('LOAD_USER'),
	userLoaded: createAction<'USER_LOADED', User>('USER_LOADED'),
	logout: createAction<'USER_LOGOUT'>('USER_LOGOUT')
}

export default UserActions
