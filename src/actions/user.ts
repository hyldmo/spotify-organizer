import { User } from '../types'
import { createAction } from './actionCreator'

const UserActions = {
	tokenAquired: createAction<'TOKEN_AQUIRED', string>('TOKEN_AQUIRED'),
	loadUser: createAction<'LOAD_USER'>('LOAD_USER'),
	userLoaded: createAction<'USER_LOADED', User>('USER_LOADED')
}

export default UserActions
