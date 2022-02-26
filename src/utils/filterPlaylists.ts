import { Filters, Playlist, Sort, User } from '~/types'
import { compareByKey } from './sort'

export function applyPlaylistsFilters(
	playlists: Playlist[],
	filters: Filters['playlists'],
	user?: User | null
): Playlist[] {
	const filteredPlaylists = playlists
		.filter(p => p.name !== null) // Needed as spotify can return playlists that doesn't exist
		.filter(p => {
			const query = filters.text.toLocaleLowerCase()
			return (
				p.name.toLocaleLowerCase().includes(query) ||
				p.owner.display_name?.toLocaleLowerCase().includes(query) ||
				p.owner.id.toLocaleLowerCase().includes(query) ||
				p.selected
			)
		})
		.filter(p => (user ? (filters.ownedOnly ? p.owner.id === user.id : true) : true))
		.filter(p => (filters.hideEmpty ? p.tracks.total > 0 : true))

	return filters.order.mode !== Sort.None
		? filteredPlaylists
				.slice()
				.sort((a, b) => compareByKey(a, b, filters.order.key, filters.order.mode === Sort.Asc))
		: filteredPlaylists
}
