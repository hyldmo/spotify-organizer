import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { combineReducers } from 'redux'
import filters from './filters'
import modals from './modals'
import notifications from './notifications'
import playback from './playback'
import playlists from './playlists'
import timer from './timer'
import user from './user'

const reducers = (history: History) =>
	combineReducers({
		filters,
		modals,
		notifications,
		playback,
		playlists,
		router: connectRouter(history),
		timer,
		user
	})

export default reducers
