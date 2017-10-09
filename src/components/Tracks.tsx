import * as React from 'react'

import { Track } from '../types'

type Props = {
	tracks: Track[]
}
const Tracks: React.StatelessComponent<Props> = ({ tracks }) => (
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
				{tracks.map((p, index) =>
					<tr key={p.id + index}>
						<td>{p.name}</td>
						<td>{p.artists.map(a => a.name).join(',')}</td>
						<td>{p.album.name}</td>
						<td>{p.meta.added_by.display_name}</td>
						<td>{p.meta.added_at}</td>
						<td>{p.duration_ms}</td>
					</tr>
				)}
			</tbody>
		</table>
	) : (
		<div>No tracks.</div>
	)
)

export default Tracks
