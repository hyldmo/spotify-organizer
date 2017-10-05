import * as _ from 'lodash'

import { Filters, Playlist, User } from '../types'
import { compareByKey } from './sort'

export function applyPlaylistsFilters (playlists: Playlist[], filters: Filters['playlists'], user: User): Playlist[] {
	const filteredPlaylists = playlists
		.slice()
		.filter(p =>
			(_.includes(p.name, filters.text) || _.includes(p.owner.display_name, filters.text))
		)

	return filters.order !== null
		? filteredPlaylists.sort((a, b) => compareByKey(a, b, filters.order.key, !filters.order.asc))
		: filteredPlaylists
}
