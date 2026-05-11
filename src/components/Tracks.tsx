import React, { useMemo } from 'react'
import { Playlist, Track } from '~/types'
import { Duration, useAppSelector } from '~/utils'
import { ArtistLinks, UriLink } from './UriLink'

type Props = {
	tracks: Track[]
	currentPlaylistId?: string
}
const Tracks: React.FC<Props> = ({ tracks, currentPlaylistId }) => {
	const playlists = useAppSelector(s => s.playlists)
	const contributors = new Set(tracks.map(t => t.meta.added_by.id))
	const plays = tracks.reduce((a, t) => a + (t.meta.plays || 0), 0)

	const otherPlaylistsByTrack = useMemo(() => {
		const map: Record<Track['id'], Playlist[]> = {}
		const candidates = playlists.filter(pl => pl.id !== currentPlaylistId && pl.tracks.lastFetched)
		for (const track of tracks) {
			map[track.id] = candidates.filter(pl => pl.tracks.items[track.id] !== undefined)
		}
		return map
	}, [playlists, tracks, currentPlaylistId])

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
					<th title="Number of other loaded playlists this track appears in">In playlists</th>
					<th title={plays > 0 ? undefined : 'Plays are tracked only while "Watch skips" is enabled in settings'}>Plays</th>
				</tr>
			</thead>
			<tbody>
				{tracks.map((track, index) => {
					const others = otherPlaylistsByTrack[track.id] || []
					return (
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
									<UriLink object={track.meta.added_by}>
										{getDisplayName(track.meta.added_by)}
									</UriLink>
								</td>
							)}
							<td>{new Date(track.meta.added_at).toLocaleDateString()}</td>
							<td>{new Duration(track.duration_ms).toMinutesString()}</td>
							<td title={others.map(pl => pl.name).join('\n')}>{others.length}</td>
							<td>{track.meta.plays ?? 0}</td>
						</tr>
					)
				})}
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
