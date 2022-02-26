import { Action, MetaAction } from '~/actions'
import { Playlist } from '~/types'
import { toPlaylist } from '~/utils'

function playlist (state: Playlist, action: MetaAction): Playlist {
	if (state.id !== action.meta) return state

	switch (action.type) {
		case 'FETCH_TRACKS_PROGRESS':
			return {
				...state,
				tracks: {
					...state.tracks,
					loaded: action.payload
				}
			}
		case 'FETCH_TRACKS_SUCCESS':
			return {
				...state,
				tracks: {
					...state.tracks,
					lastFetched: new Date(),
					items: action.payload,
					loaded: action.payload.length
				}
			}
		case 'PLAYLISTS_SELECT':
			return { ...state, selected: action.payload }
		default:
			return state
	}
}

export default function playlists (state: Playlist[] = [], action: Action): Playlist[] {
	switch (action.type) {
		case 'FETCH_PLAYLISTS_SUCCESS':
			return action.payload.map(p => {
				const existing = state.find(s => s.id == p.id)
				return toPlaylist(p, existing)
			})
		case 'PLAYLISTS_SELECT':
		case 'FETCH_TRACKS_SUCCESS':
		case 'FETCH_TRACKS_PROGRESS':
			return state.map(p => playlist(p, action))
		case 'PLAYLISTS_SELECT_ALL':
			return state.map(p => ({ ...p, selected: action.payload }))
		default:
			return state
	}
}
