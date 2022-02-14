import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'types'
import { ArtistLinks, UriLink } from 'components/UriLink'
import { Actions } from 'actions'
import { idToUri } from 'utils'
import { countSkips, Props, SkipStats } from './skipUtils'

export const ByPlaylist: React.FC<Props> = ({ skipData, countNonPlaylists, allPlaylists }) => {
	const dispatch = useDispatch()
	const user = useSelector((s: State) => s.user)

	// const instead of return to reduce indentention level
	const retval = skipData
		.filter(pl => (countNonPlaylists ? pl.uri.includes('playlist') : true))
		.filter(pl => (allPlaylists ? pl.owner?.id === user?.id : true))
		.sort((a, b) => countSkips(b) - countSkips(a))
		.map((playlist, i, { length }) => (
			<li key={playlist.uri} className={cn('py-2', { 'border-b-2 border-b-gray-300': i < length - 1 })}>
				<div
					className={cn(
						'grid grid-rows-2 grid-cols-[auto,3fr,1fr] grid-flow-col items-center',
						'space-x-2 border-b border-b-gray-600 p-2'
					)}
				>
					{playlist.images?.[0] && (
						<img className="row-span-2 space-x-2 inline h-12" src={playlist.images[0].url} />
					)}
					<span className="row-start-1">
						<UriLink object={playlist} />
					</span>
					<UriLink object={playlist.owner} className="col-start-2 row-start-2 ellipsis opacity-60" />
					<span className="row-span-2 justify-self-end">Total skips: {countSkips(playlist)}</span>
				</div>
				<div className="p-2 grid gap-x-4 grid-cols-[auto,auto,1fr,auto] items-center justify-between">
					{playlist.songs
						.filter(song => song.skips)
						// Only show songs that are still in the playlist
						.filter(song => playlist.tracks?.items?.some(s => s.id == song.id))
						.map(({ id, ...stats }) => {
							const song = playlist.tracks?.items?.find(s => s.id == id)
							return (
								<Fragment key={id}>
									{playlist.owner?.id == user?.id && (
										<button
											className="opacity-40 hover:opacity-80"
											onClick={_ =>
												dispatch(
													Actions.deleteTracks([idToUri(id, 'track')], {
														id: playlist.id as string,
														snapshot_id: playlist.snapshot_id as string
													})
												)
											}
										>
											<FontAwesomeIcon
												className="align-baseline"
												icon="trash-alt"
												size="xs"
												aria-hidden="true"
											/>
										</button>
									)}
									<UriLink object={song} />
									<ArtistLinks artists={song?.artists} />
									<SkipStats {...stats} />
								</Fragment>
							)
						})}
				</div>
			</li>
		))
	return <>{retval}</>
}
