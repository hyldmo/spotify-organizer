import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actions } from '../actions'
import Loading from '../components/Loading'
import Tracks from '../components/Tracks'
import { Duration } from '../utils'
import { State } from '../types'
import { useParams } from 'react-router'
import { UriLink } from 'components/UriLink'

const TracksRoute: React.FC = () => {
	const dispatch = useDispatch()
	const params = useParams<{ id: string }>()

	useEffect(() => {
		if (params.id) dispatch(Actions.fetchTracks(params.id))
	}, [dispatch, params.id])

	const playlist = useSelector((s: State) => s.playlists.find(p => p.id === params.id))
	if (playlist === undefined) return <Loading />
	if (playlist.tracks.loaded < playlist.tracks.total || playlist.tracks.items === undefined)
		return <Loading progress={{ current: playlist.tracks.loaded, total: playlist.tracks.total }} />

	const tracks = playlist.tracks.items
	const duration = tracks.reduce((a, b) => a + b.duration_ms, 0)
	return (
		<div className="manager tracks">
			<div className="header row p-2">
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
					<li>{tracks.length} Tracks</li>
					<li>{new Duration(duration).toString()}</li>
				</ul>
			</div>
			<hr />
			<Tracks tracks={tracks} />
		</div>
	)
}

export default TracksRoute