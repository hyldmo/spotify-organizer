import { includes } from 'lodash'

import { Filters, Playlist, Sort, User } from '../types'
import { compareByKey } from './sort'

export function applyPlaylistsFilters (playlists: Playlist[], filters: Filters['playlists'], user: User): Playlist[] {
	const filteredPlaylists = playlists
		.slice()
		.filter(p => p.name !== null) // Needed as spotify can return playlists that doesn't exist
		.filter(p => {
			const query = filters.text.toLocaleLowerCase()
			return includes(p.name.toLocaleLowerCase(), query) || includes((p.owner.display_name || p.owner.id).toLocaleLowerCase(), query)
		})
		.filter(p => filters.ownedOnly ? p.owner.id === user.name : true)
		.filter(p => filters.hideEmpty ? p.tracks.total > 0 : true)

	return filters.order.mode !== Sort.None
		? filteredPlaylists.sort((a, b) => compareByKey(a, b, filters.order.key, filters.order.mode === Sort.Asc))
		: filteredPlaylists
}
