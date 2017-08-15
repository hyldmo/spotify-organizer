import { routerReducer as routing, RouterState } from 'react-router-redux'
import { combineReducers } from 'redux'
import user, { User } from './user'

export type State = Readonly<{
	user: User
	routing: RouterState
}>

const reducers = combineReducers<State>({
	routing,
	user
})

export default reducers
