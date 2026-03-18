import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cn from 'classnames'
import React, { Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actions } from '~/actions'
import { ArtistLinks, UriLink } from '~/components/UriLink'
import { PlaylistSkipEntry, State } from '~/types'
import { idToUri } from '~/utils'
import { SkipStats } from './SkipStats'
import { countSkips, findSong, Props } from './skipUtils'

export const ByPlaylist: React.FC<Props> = ({ filterIds, skipData, countNonPlaylists, allPlaylists, minSkips }) => {
	const dispatch = useDispatch()
	const user = useSelector((s: State) => s.user)

	const filterSongs = (pl: PlaylistSkipEntry) =>
		pl.songs
			.filter(({ skips = 0 }) => skips >= minSkips)
			.filter(song => (countNonPlaylists ? pl.tracks?.items[song.id] !== undefined : true))

	// const instead of return to reduce indentention level
	const retval = skipData
		.filter(pl => (allPlaylists ? pl.owner?.id === user?.spotify.id : true))
		.filter(pl => (filterIds ? filterIds.includes(pl.id || '') || filterIds.includes(pl.uri) : true))
		.filter(pl => filterSongs(pl).length > 0)
		.sort((a, b) => countSkips(b) - countSkips(a))
		.map((playlist, i, { length }) => (
			<li key={playlist.uri + i} className={cn('py-2', { 'border-b-2 border-b-gray-300': i < length - 1 })}>
				<div
					className={cn(
						'grid grid-rows-2 grid-cols-[auto,3fr,auto,auto] grid-flow-col items-center',
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
					{playlist.owner?.id === user?.spotify.id && (
						<button
							className={cn(
								'row-span-2 justify-self-end text-sm px-2 py-1',
								'opacity-60 hover:opacity-100 text-red-400',
								'hover:text-red-300 border border-current rounded'
							)}
							title={`Remove all tracks with ${minSkips}+ skips from this playlist`}
							onClick={_ => {
								const skippedSongs = filterSongs(playlist)
								const uris = skippedSongs.map(s => idToUri(s.id, 'track'))
								if (uris.length === 0) return
								if (window.confirm(`Remove ${uris.length} skipped track(s) from "${playlist.name}"?`)) {
									dispatch(
										Actions.deleteTracks(uris, {
											id: playlist.id as string,
											snapshot_id: playlist.snapshot_id as string
										})
									)
								}
							}}
						>
							<FontAwesomeIcon icon="trash-alt" size="sm" /> Remove all skipped
						</button>
					)}
				</div>
				<div className="p-2 grid gap-x-1 grid-cols-[auto,auto,minmax(35%,1fr),repeat(7,auto)] items-baseline">
					{filterSongs(playlist)
						.sort((a, b) => (b.skips || 0) - (a.skips || 0))
						.map(({ id, ...stats }, j) => {
							const song = findSong(id)
							if (!song) return null
							return (
								<Fragment key={id + j}>
									{playlist.owner?.id == user?.spotify.id ? (
										<button
											className="opacity-40 hover:opacity-80 mr-3"
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
									) : (
										<span />
									)}
									<UriLink object={song} className="mr-4" />
									<ArtistLinks artists={song?.artists} />
									<SkipStats
										{...stats}
										onRemoveClick={_ => dispatch(Actions.resetSkips(song.id, playlist.uri))}
									/>
								</Fragment>
							)
						})}
				</div>
			</li>
		))
	return <>{retval}</>
}
