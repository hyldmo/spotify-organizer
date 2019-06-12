import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { combineReducers } from 'redux'
import filters from './filters'
import modals from './modals'
import notifications from './notifications'
import playlists from './playlists'
import timer from './timer'
import user from './user'

export type State = ReturnType<ReturnType<typeof reducers>>

const reducers = (history: History) => combineReducers({
	filters,
	modals,
	notifications,
	playlists,
	router: connectRouter(history),
	timer,
	user
})

export default reducers
