import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import filters from './filters'
import modals from './modals'
import playlists from './playlists'
import timer from './timer'
import user from './user'

export type State = {
	user: ReturnType<typeof user>
	routing: ReturnType<typeof routing>
	modals: ReturnType<typeof modals>
	playlists: ReturnType<typeof playlists>
	filters: ReturnType<typeof filters>
	timer: ReturnType<typeof timer>
}

const reducers = combineReducers<State>({
	filters,
	modals,
	playlists,
	routing,
	timer,
	user
})

export default reducers
