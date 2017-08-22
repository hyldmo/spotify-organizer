import { Action } from '../actions'
import { Playlist } from '../types'

type PlaylistKey = keyof Playlist | null | string

export type Filters = {
	playlists: {
		order: {
			key: PlaylistKey
			asc: boolean
		}
	}
}

const initialState: Filters = {
 	playlists: {
		order: {
			key: 'name',
			asc: true
		}
	}
}

export default function user (state: Filters = initialState, action: Action): Filters {
	switch (action.type) {
		case 'PLAYLISTS_SORT_MODE_CHANGE':
			return {
				...state,
				playlists: {
					order: {
						key: action.meta,
						asc: action.payload
					}
				}
			}
		default:
			return state
	}
}

