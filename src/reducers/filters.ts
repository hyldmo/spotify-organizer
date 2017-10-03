import { Action } from '../actions'
import { Playlist } from '../types'

type PlaylistKey = keyof Playlist | null | string

export type Filters = {
	playlists: {
		order: {
			key: PlaylistKey
			asc: boolean
		}
		text: string
	}
}

const initialState: Filters = {
 	playlists: {
		order: {
			key: 'name',
			asc: true
		},
		text: ''
	}
}

export default function user (state: Filters = initialState, action: Action): Filters {

	switch (action.type) {
		case 'PLAYLISTS_SORT_MODE_CHANGE':
			return {
				...state,
				playlists: {
					...state.playlists,
					order: {
						key: action.meta,
						asc: action.payload
					}
				}
			}

		case 'PLAYLISTS_FILTER_TEXT_CHANGE':
			return {
				...state,
				playlists: {
					...state.playlists,
					text:  action.payload
				}
			}

		default:
			return state
	}
}

