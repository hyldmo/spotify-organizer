import * as React from 'react'
import { Link } from 'react-router-dom'

import { Actions } from '../actions'
import Highlight from '../components/Highlight'
import { BASE_URL } from '../constants'
import { Filters, Playlist, Sort } from '../types'

const headers = [
	['Name', 'name'],
	['Owner', 'owner.display_name'],
	['Tracks', 'tracks.total']
]

type Props = {
	playlists: Playlist[]
	filters: Filters['playlists']
	selectAll: typeof Actions.selectPlaylists
	changeSortMode: typeof Actions.updatePlaylistsSort
	select: typeof Actions.selectPlaylist
}

const Playlists: React.StatelessComponent<Props> = ({ playlists, select, selectAll, changeSortMode, filters }) => (
	playlists.length > 0 ? (
		<table className="playlists">
			<thead>
				<tr>
					<th className="select"><input type="checkbox" onChange={e => selectAll(e.target.checked)}/></th>
					<th className="image"></th>
					{headers.map(([name, key]) => (
						<th key={name} >
							<a onClick={e => changeSortMode(getNextSortMode(filters.order.key === key, filters.order.mode), key)}>
								{name}
							</a>
							&nbsp;{getSortIcon(filters.order.key === key, filters.order.mode)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{playlists.map(p =>
					<tr key={p.id}>
						<td>
							<input type="checkbox" checked={p.selected} onChange={e => select(e.target.checked, p.id)} />
						</td>
						<td className="images">
							{p.images.length > 0 ? <img src={p.images.slice().sort(i => i.height as number)[0].url} /> : null}
						</td>
						<td>
							<Link to={`${BASE_URL}users/${p.owner.id}/playlists/${p.id}`}>
								<Highlight text={p.name} term={filters.text} />
							</Link>
						</td>
						<td>
							<Highlight text={p.owner.display_name || p.owner.id} term={filters.text} />
						</td>
						<td>
							{p.tracks.total}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	) : null
)

function getSortIcon (isOwn: boolean, order: Sort) {
	if (!isOwn)
		return null

	switch (order) {
		case Sort.Asc:
			return <i className="fa fa-sort-amount-asc" aria-hidden="true" />
		case Sort.Desc:
			return <i className="fa fa-sort-amount-desc" aria-hidden="true" />
		default:
			return null
	}
}

function getNextSortMode (isOwn: boolean, order: Sort): Sort {
	if (!isOwn)
		return Sort.Desc

	switch (order) {
		case Sort.Asc:
			return Sort.None
		case Sort.Desc:
			return Sort.Asc
		case Sort.None:
			return Sort.Desc
	}
}

export default Playlists
