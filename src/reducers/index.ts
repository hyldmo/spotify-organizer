import { routerReducer as routing, RouterState } from 'react-router-redux'
import { combineReducers } from 'redux'
import playlists from './playlists'
import user, { User } from './user'

export type State = Readonly<{
	user: User
	routing: RouterState
	playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items']
}>

const reducers = combineReducers<State>({
	routing,
	user,
	playlists
})

export default reducers
