import { routerReducer as routing, RouterState } from 'react-router-redux'
import { combineReducers } from 'redux'

import { Playlist } from '../types'
import { Filters, Modal, User } from '../types'
import filters from './filters'
import modals from './modals'
import playlists from './playlists'
import timer from './timer'
import user from './user'

export type State = Readonly<{
	user: User
	routing: RouterState
	modals: Modal[]
	playlists: Playlist[]
	filters: Filters
	timer: number
}>

const reducers = combineReducers<State>({
	filters,
	modals,
	playlists,
	routing,
	timer,
	user
})

export default reducers
