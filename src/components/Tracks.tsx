import React from 'react'
import { Track } from '~/types'
import { Duration } from '~/utils'
import { ArtistLinks, UriLink } from './UriLink'

type Props = {
	tracks: Track[]
}
const Tracks: React.FC<Props> = ({ tracks }) => {
	const contributors = new Set(tracks.map(t => t.meta.added_by.id))
	const plays = tracks.reduce((a, t) => a + (t.meta.plays || 0), 0)
	return tracks.length > 0 ? (
		<table className="playlists">
			<thead className="sticky top-0 bg-black">
				<tr>
					<th>Name</th>
					<th>Artist</th>
					<th>Album</th>
					{contributors.size > 1 && <th>Added by</th>}
					<th>Added at</th>
					<th>Duration</th>
					{plays > 0 && <th>Plays</th>}
				</tr>
			</thead>
			<tbody>
				{tracks.map((track, index) => (
					<tr key={track.id + index}>
						<td>
							<UriLink object={track} />
						</td>
						<td>
							<ArtistLinks artists={track.artists} />
						</td>
						<td>
							<UriLink object={track.album} />
						</td>
						{contributors.size > 1 && (
							<td>
								<UriLink object={track.meta.added_by}>{getDisplayName(track.meta.added_by)}</UriLink>
							</td>
						)}
						<td>{new Date(track.meta.added_at).toLocaleDateString()}</td>
						<td>{new Duration(track.duration_ms).toMinutesString()}</td>
						{plays > 0 && <td>{track.meta.plays}</td>}
					</tr>
				))}
			</tbody>
		</table>
	) : (
		<div>No tracks.</div>
	)
}

function getDisplayName (addedBy: Track['meta']['added_by']): string {
	return addedBy === null ? 'Spotify' : addedBy.display_name || addedBy.id
}

export default Tracks
