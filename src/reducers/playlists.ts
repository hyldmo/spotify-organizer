import { Action } from '../actions'

type Playlists = SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items']

export default function user (state: Playlists = [], action: Action): Playlists {
	switch (action.type) {
		case 'FETCH_PLAYLISTS_SUCCESS':
			return action.payload
		default:
			return state
	}
}

