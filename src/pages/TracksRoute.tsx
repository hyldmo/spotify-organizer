import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actions } from '../actions'
import Loading from '../components/Loading'
import Tracks from '../components/Tracks'
import { Duration } from '../utils'
import { State } from '../types'
import { useParams } from 'react-router'

const TracksRoute: React.FC = () => {
	const dispatch = useDispatch()
	const params = useParams<{ id: string; user: string }>()

	useEffect(() => {
		if (params.id && params.user) dispatch(Actions.fetchTracks({ id: params.id, owner: params.user }))
	}, [dispatch, params.id, params.user])

	const playlist = useSelector((s: State) => s.playlists.find(p => p.id === params.id))
	if (playlist === undefined) return <Loading />
	if (playlist.tracks.loaded < playlist.tracks.total || playlist.tracks.items === undefined)
		return <Loading progress={{ current: playlist.tracks.loaded, total: playlist.tracks.total }} />

	const tracks = playlist.tracks.items
	const duration = tracks.reduce((a, b) => a + b.duration_ms, 0)
	return (
		<div className="manager tracks">
			<div className="header row">
				{playlist.images.length > 0 ? (
					<img src={playlist.images.reduce((a, b) => (a.height || 0 > (b.height || 0) ? a : b)).url} />
				) : null}
				<div className="info">
					{playlist.collaborative && (
						<p>
							<strong>Collaborative Playlist</strong>
						</p>
					)}
					<h2>{playlist.name}</h2>
					<p>TODO: Fetch description{playlist.description}</p>
					<p>
						Created by: <strong>{playlist.owner.display_name || playlist.owner.id}</strong>
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
