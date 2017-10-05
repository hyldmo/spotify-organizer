import * as React from 'react'
import { Link } from 'react-router-dom'

import { Actions } from '../actions'
import Highlight from '../components/Highlight'
import { Filters, Playlist } from '../types'

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
							<a onClick={e => changeSortMode(filters.order.key === key && !filters.order.asc, key)}>
								{name} { filters.order.key === key ? filters.order.asc ? '↓' : '↑' : ''}
							</a>
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
							{p.images.length > 0 ? <img src={p.images[p.images.length - 1].url} /> : null}
						</td>
						<td>
							<Link to={`playlists/${p.id}`}>
								<Highlight text={p.name} term={filters.text} />
							</Link>
						</td>
						<td>
							<Highlight text={p.owner.display_name} term={filters.text} />
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

export default Playlists
