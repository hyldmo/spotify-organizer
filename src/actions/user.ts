import { Playlist, User } from '../types'
import { createAction } from './actionCreator'

const UserActions = {
	tokenAquired: createAction<'TOKEN_AQUIRED', string>('TOKEN_AQUIRED'),
	loadUser: createAction<'LOAD_USER'>('LOAD_USER'),
	userLoaded: createAction<'USER_LOADED', User>('USER_LOADED'),
	fetchPlaylists: createAction<'FETCH_PLAYLISTS', string>('FETCH_PLAYLISTS'),
	playlistsFetched: createAction<'FETCH_PLAYLISTS_SUCCESS', SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items']>('FETCH_PLAYLISTS_SUCCESS'),
	selectPlaylist: createAction<'PLAYLISTS_SELECT', boolean, string>('PLAYLISTS_SELECT'),
	selectPlaylists: createAction<'PLAYLISTS_SELECT_ALL', boolean>('PLAYLISTS_SELECT_ALL'),
	updatePlaylistsSort: createAction<'PLAYLISTS_SORT_MODE_CHANGE', boolean, keyof Playlist | string>('PLAYLISTS_SORT_MODE_CHANGE'),
	updateHideEmptyFilter: createAction<'PLAYLISTS_FILTER_EMPTY_CHANGE', boolean>('PLAYLISTS_FILTER_EMPTY_CHANGE'),
	updateOwnedFilter: createAction<'PLAYLISTS_FILTER_OWNED_CHANGE', boolean>('PLAYLISTS_FILTER_OWNED_CHANGE'),
	updateFilterText: createAction<'PLAYLISTS_FILTER_TEXT_CHANGE', string>('PLAYLISTS_FILTER_TEXT_CHANGE')
}

export default UserActions
