import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import type { Actions } from '~/actions'
import Highlight from '~/components/Highlight'
import type { Filters, Playlist, Sort } from '~/types'
import { getNextSortMode, getSortIcon } from '~/utils'
import { UriLink } from './UriLink'

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

type RowProps = {
	playlist: Playlist
	term: string
	multi: boolean
	select: (checked: boolean, id: string) => void
}

const PlaylistRowBase = ({ playlist: p, term, multi, select }: RowProps) => (
	<tr>
		<td className="select">
			{multi ? (
				<input type="checkbox" checked={p.selected} onChange={e => select(e.target.checked, p.id)} />
			) : (
				<input
					type="radio"
					name="playlist"
					value={p.id}
					checked={p.selected}
					onChange={() => select(true, p.id)}
				/>
			)}
		</td>
		<td className="image">
			{p.images?.length > 0 ? (
				<img src={p.images.slice().sort(i => i.height as number)[0].url} loading="lazy" decoding="async" />
			) : null}
		</td>
		<td className="name space-x-2">
			<UriLink object={p}>
				<Highlight text={p.name} term={term} />
			</UriLink>
			{p.tracks.loaded === p.tracks.total && (
				<FontAwesomeIcon
					icon="save"
					size="xs"
					alignmentBaseline="middle"
					color="green"
					title="Cached tracklist locally"
				/>
			)}
		</td>
		<td className="owner">
			<Highlight text={p.owner.display_name || p.owner.id} term={term} />
		</td>
		<td className="tracks">{p.tracks.total}</td>
	</tr>
)

// Memoised: the playlist list re-renders on every track-load progress tick, but
// unchanged playlist objects (and a stable `term`/`multi`/`select`) let those
// rows skip rendering. Covers stay lazy so the hundreds off-screen never decode.
const PlaylistRow = React.memo(PlaylistRowBase)

const Playlists: React.FC<Props> = ({ playlists, select, selectAll, changeSortMode, filters }) => {
	if (playlists.length == 0) return null
	return (
		<table className="playlists">
			<thead className="sticky top-0 bg-inherit">
				<tr>
					<th className="select">
						{selectAll && <input type="checkbox" onChange={e => selectAll(e.target.checked)} />}
					</th>
					<th className="image"></th>
					{headers.map(([name, key]) => (
						<th key={name} className={name.toLocaleLowerCase()}>
							<a
								onClick={_ =>
									changeSortMode(getNextSortMode(filters.order.key === key, filters.order.mode), key)
								}
							>
								{name}
							</a>
							&nbsp;{getSortIcon(filters.order.key === key, filters.order.mode)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{playlists.map(p => (
					<PlaylistRow key={p.id} playlist={p} term={filters.text} multi={!!selectAll} select={select} />
				))}
			</tbody>
		</table>
	)
}

export default Playlists
