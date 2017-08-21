import { User } from '../reducers/user'
import { createAction } from './actionCreator'

const UserActions = {
	tokenAquired: createAction<'TOKEN_AQUIRED', string>('TOKEN_AQUIRED'),
	loadUser: createAction<'LOAD_USER'>('LOAD_USER'),
	userLoaded: createAction<'USER_LOADED', User>('USER_LOADED'),
	fetchPlaylists: createAction<'FETCH_PLAYLISTS', string>('FETCH_PLAYLISTS'),
	playlistsFetched: createAction<'FETCH_PLAYLISTS_SUCCESS', SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items']>('FETCH_PLAYLISTS_SUCCESS')
}

export default UserActions
