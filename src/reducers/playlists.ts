import { Action } from '../actions'
import { Playlist } from '../types'

function playlist (state: Playlist, action: Action): Playlist {
	if (state.id !== action.meta)
		return state

	switch (action.type) {
		case 'PLAYLISTS_SELECT':
			return { ...state, selected: action.payload }
		default:
			return state
	}
}

export default function playlists (state: Playlist[] = [], action: Action): Playlist[] {
	switch (action.type) {
		case 'FETCH_PLAYLISTS_SUCCESS':
			return action.payload.map(p => ({ ...p, selected: false }))
		case 'PLAYLISTS_SELECT':
			return state.map(p => playlist(p, action))
		case 'PLAYLISTS_SELECT_ALL':
			return state.map(p => ({ ...p, selected: action.payload }))
		default:
			return state
	}
}

