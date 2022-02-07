import React from 'react'

import { Track } from '../types'
import { Duration } from '../utils'

type Props = {
	tracks: Track[]
}
const Tracks: React.FC<Props> = ({ tracks }) =>
	tracks.length > 0 ? (
		<table className="playlists">
			<thead>
				<tr>
					<th>Name</th>
					<th>Artist</th>
					<th>Album</th>
					<th>User</th>
					<th>Added at</th>
					<th>Duration</th>
				</tr>
			</thead>
			<tbody>
				{tracks.map((p, index) => (
					<tr key={p.id + index}>
						<td>{p.name}</td>
						<td>{p.artists.map(a => a.name).join(', ')}</td>
						<td>{p.album.name}</td>
						<td>{getDisplayName(p.meta.added_by)}</td>
						<td>{new Date(p.meta.added_at).toLocaleDateString()}</td>
						<td>{new Duration(p.duration_ms).toMinutesString()}</td>
					</tr>
				))}
			</tbody>
		</table>
	) : (
		<div>No tracks.</div>
	)

function getDisplayName(addedBy: Track['meta']['added_by']): string {
	return addedBy === null ? 'Spotify' : addedBy.display_name || addedBy.id
}

export default Tracks
