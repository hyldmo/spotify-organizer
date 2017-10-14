import { Action } from '../actions'
import { Filters, Sort } from '../types'

const initialState: Filters = {
 	playlists: {
		order: {
			key: 'name',
			mode: Sort.None
		},
		text: '',
		ownedOnly: false,
		hideEmpty: false
	}
}

type PlaylistFilters = Filters['playlists']
function playlists (state: PlaylistFilters, action: Action): PlaylistFilters {
	switch (action.type) {
		case 'PLAYLISTS_SORT_MODE_CHANGE':
		return {
			...state,
			order: {
				key: action.meta,
				mode: action.payload
			}
		}

		case 'PLAYLISTS_FILTER_OWNED_CHANGE':
			return {
				...state,
				ownedOnly: action.payload
			}
		case 'PLAYLISTS_FILTER_EMPTY_CHANGE':
			return {
				...state,
				hideEmpty: action.payload
			}
		case 'PLAYLISTS_FILTER_TEXT_CHANGE':
			return {
				...state,
				text:  action.payload
			}

		default:
			return state
	}
}

export default function filters (state: Filters = initialState, action: Action): Filters {
	switch (action.type) {
		case 'PLAYLISTS_FILTER_OWNED_CHANGE':
		case 'PLAYLISTS_FILTER_EMPTY_CHANGE':
		case 'PLAYLISTS_FILTER_TEXT_CHANGE':
		case 'PLAYLISTS_SORT_MODE_CHANGE':
			return {
				...state,
				playlists: playlists(state.playlists, action)
			}

		default:
			return state
	}
}

