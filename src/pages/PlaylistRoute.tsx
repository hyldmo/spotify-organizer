import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Loading from '~/components/Loading'
import Tracks from '~/components/Tracks'
import { UriLink } from '~/components/UriLink'
import { Duration, idToUri, songEntriesToSongs, usePlaylist } from '~/utils'

const PlaylistRoute: React.FC = () => {
	const params = useParams<{ id: string }>()
	const playlist = usePlaylist(params.id || '')

	if (!playlist || playlist.tracks.loaded == null)
		return <Loading>Loading {idToUri(params.id || '', 'playlist')}</Loading>
	if (playlist.tracks.loaded < playlist.tracks.total)
		return <Loading progress={{ current: playlist.tracks.loaded, total: playlist.tracks.total }} />

	const tracks = songEntriesToSongs(playlist.tracks.items)
	const duration = tracks.reduce((a, b) => a + b.duration_ms, 0)

	return (
		<div className="manager tracks">
			<div className="header row p-2 relative">
				{playlist.images.length > 0 ? (
					<img src={playlist.images.reduce((a, b) => (a.height || 0 > (b.height || 0) ? a : b)).url} />
				) : null}
				<div className="info space-y-2">
					{playlist.collaborative && (
						<p>
							<strong>Collaborative Playlist</strong>
						</p>
					)}
					<h2 className="text-2xl">{playlist.name}</h2>
					<p className="opacity-80">{playlist.description}</p>
					<p>
						Created by: <UriLink className="font-bold" object={playlist.owner} />
					</p>
				</div>
				<span className="filler" />
				<ul className="stats right-menu">
					<li>{playlist.followers?.total}</li>
					<li>{tracks.length} Tracks</li>
					<li>{new Duration(duration).toString('minutes')}</li>
				</ul>
				<Link
					to={`/skips?filterId=${playlist.uri}&groupBy=playlist`}
					className="absolute top-2 right-2 space-x-2"
				>
					<FontAwesomeIcon icon="share" />
					<span>View all skips</span>
				</Link>
			</div>
			<hr />
			<Tracks tracks={tracks} />
		</div>
	)
}

export default PlaylistRoute
