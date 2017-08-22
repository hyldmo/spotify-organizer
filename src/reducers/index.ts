import { routerReducer as routing, RouterState } from 'react-router-redux'
import { combineReducers } from 'redux'
import { Playlist } from '../types'

import filters, { Filters } from './filters'
import playlists from './playlists'
import user, { User } from './user'

export type State = Readonly<{
	user: User
	routing: RouterState
	playlists: Playlist[]
	filters: Filters
}>

const reducers = combineReducers<State>({
	routing,
	user,
	playlists,
	filters
})

export default reducers
