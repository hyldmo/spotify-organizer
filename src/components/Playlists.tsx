import * as React from 'react'
import { Link } from 'react-router-dom'

import { Actions } from '../actions'
import Highlight from '../components/Highlight'
import { BASE_URL } from '../constants'
import { Filters, Playlist, Sort } from '../types'
import { getNextSortMode, getSortIcon } from '../utils'

const headers = [
	['Name', 'name'],
	['Owner', 'owner.display_name'],
	['Tracks', 'tracks.total']
]

type Props = {
	playlists: Playlist[]
	filters: Filters['playlists']
	selectAll?: typeof Actions.selectPlaylists // If omitted, select will be a radio component
	changeSortMode: (payload: Sort, meta: string) => void
	select: (checked: boolean, id: string) => void
}

const Playlists: React.StatelessComponent<Props> = ({ playlists, select, selectAll, changeSortMode, filters }) => (
	playlists.length > 0 ? (
		<table className="playlists">
			<thead>
				<tr>
					<th className="select">{selectAll && <input type="checkbox" onChange={e => selectAll(e.target.checked)}/>}</th>
					<th className="image"></th>
					{headers.map(([name, key]) => (
						<th key={name} className={name.toLocaleLowerCase()}>
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
						<td className="select">{selectAll ? (
							<input type="checkbox" checked={p.selected} onChange={e => select(e.target.checked, p.id)} />
						) : (
							<input type="radio" name="playlist" value={p.id} checked={p.selected} onChange={() => select(true, p.id)}
							/>
						)}</td>
						<td className="image">
							{p.images.length > 0 ? <img src={p.images.slice().sort(i => i.height as number)[0].url} /> : null}
						</td>
						<td className="name">
							<Link to={`${BASE_URL}users/${p.owner.id}/playlists/${p.id}`}>
								<Highlight text={p.name} term={filters.text} />
							</Link>
						</td>
						<td className="owner">
							<Highlight text={p.owner.display_name || p.owner.id} term={filters.text} />
						</td>
						<td className="tracks">
							{p.tracks.total}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	) : null
)

export default Playlists
