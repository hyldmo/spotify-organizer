import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ArtistLinks, UriLink } from 'components/UriLink'
import { startCase, uniq } from 'lodash/fp'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { Actions } from '../actions'
import { State } from '../types'
import { Duration, useFirebase } from '../utils'

export const TrackRoute: React.FC = () => {
	const dispatch = useDispatch()
	const { track, artists } = useSelector((s: State) => s.song)
	const playlists = useSelector((s: State) => s.playlists)
	const user = useSelector((s: State) => s.user)
	const params = useParams<{ id: string }>()
	const plays = useFirebase(`users/${user?.id}/plays/`)
	const skips = useFirebase(`users/${user?.id}/skips/`)

	useEffect(() => {
		if (params.id) dispatch(Actions.fetchTrack(params.id))
	}, [dispatch, params.id])

	if (!track || !artists) return <div className="m-auto p-8 text-center text-2xl">Loading track...</div>

	const genres = uniq(artists.flatMap(a => a.genres).map(startCase)).join(', ')
	return (
		<div className="p-4 grid gap-4 grid-cols-[10rem,auto]">
			<img className="row-start-1 row-span-2" src={track.album.images[0]?.url} alt={track.album.name} />
			<div className="row-start-1 col-start-2">
				<h2 className="text-2xl font-bold">
					<UriLink object={track} />
				</h2>
			</div>
			<div className="row-start-2 col-start-2">
				<h2 className="text-xl font-bold">Artists</h2>
				<ArtistLinks artists={track.artists} />
			</div>
			<div className="row-start-2 col-start-3">
				<h2 className="text-xl font-bold">Album</h2>
				<p>
					<UriLink object={track.album} />
				</p>
			</div>
			<div className="row-start-1 col-start-3">
				<h2 className="text-xl font-bold">Duration</h2>
				<p>{new Duration(track.duration_ms).toMinutesString()}</p>
			</div>
			<div className="col-start-1">
				<h2 className="text-xl font-bold">Plays</h2>
				<p>
					{plays &&
						Object.values(plays)
							.flatMap(ctx => ctx[track.id] || 0)
							.reduce((a, b) => a + b, 0)}
				</p>
			</div>
			<div className="col-start-2">
				<h2 className="text-xl font-bold">Skips</h2>
				<p>
					{skips &&
						Object.values(skips)
							.flatMap(ctx => ctx[track.id] || 0)
							.reduce((a, b) => a + b, 0)}
				</p>
			</div>
			<Link to={`/skips?songId=${track.id}`} className="col-start-3 self-center text-xl font-bold space-x-2">
				<FontAwesomeIcon icon="share" />
				<span>View all skips</span>
			</Link>

			<div className="col-span-3">
				<h2 className="text-xl font-bold">Artists Genres</h2>
				<p>{genres.length > 0 ? genres : 'No genre data from Spotify'}</p>
			</div>
			<div className="col-span-3">
				<h2 className="text-xl font-bold">Popularity</h2>
				<p>{track.popularity} / 100</p>
				<p className="text-xs italic opacity-90">
					The popularity of the track. The value will be between 0 and 100, with 100 being the most popular.
					The popularity of a track is a value between 0 and 100, with 100 being the most popular. The
					popularity is calculated by algorithm and is based, in the most part, on the total number of plays
					the track has had and how recent those plays are. Generally speaking, songs that are being played a
					lot now will have a higher popularity than songs that were played a lot in the past.
				</p>
			</div>
			<div>
				<h2 className="text-xl font-bold">In playlists</h2>
				<ul>
					{playlists
						.filter(pl => pl.tracks.items[track.id] !== undefined)
						.map(pl => (
							<li key={pl.id}>
								<UriLink object={pl} />
							</li>
						))}
				</ul>
			</div>
		</div>
	)
}
