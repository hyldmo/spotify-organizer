import * as _ from 'lodash'

import { Filters, Playlist, Sort, User } from '../types'
import { compareByKey } from './sort'

export function applyPlaylistsFilters (playlists: Playlist[], filters: Filters['playlists'], user: User): Playlist[] {
	const filteredPlaylists = playlists
		.slice()
		.filter(p => _.includes(p.name, filters.text) || _.includes(p.owner.display_name, filters.text))
		.filter(p => filters.ownedOnly ? p.owner.id === user.name : true)
		.filter(p => filters.hideEmpty ? p.tracks.total > 0 : true)

	return filters.order.mode !== Sort.None
		? filteredPlaylists.sort((a, b) => compareByKey(a, b, filters.order.key, filters.order.mode === Sort.Asc))
		: filteredPlaylists
}
