import cn from 'classnames'
import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actions } from '~/actions'
import { ArtistLinks, UriLink } from '~/components/UriLink'
import { SkipEntry, SkipEntryPlaylist, State } from '~/types'
import { idToUri } from '~/utils'
import { findPlaylist, findPlays, findSong, Props, SkipStats } from './skipUtils'

export const ByTrack: React.FC<Props> = ({ filterIds, skipData, countNonPlaylists, allPlaylists }) => {
	const dispatch = useDispatch()
	const playlists = useSelector((s: State) => s.playlists)
	const user = useSelector((s: State) => s.user)

	const songSkips = useMemo(() => {
		const songIds = new Set(skipData.flatMap(a => a.songs.map(s => s.id)))
		return Array.from(songIds).map<SkipEntry>(id => {
			const song = findSong(id) || { uri: idToUri(id, 'track') }
			const skips = skipData
				.filter(pl => pl.songs.find(s => s.id == id))
				.map<SkipEntryPlaylist>(pl => ({ ...pl, ...findPlays(id, pl) }))
			return {
				song,
				playlists: skips
			}
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [skipData])
	const totalSkips = (e: SkipEntryPlaylist[]) => e.reduce((a, b) => a + b.skips, 0)
	// const instead of return to reduce indentention level
	const retval = songSkips
		.filter(s => totalSkips(s.playlists) > 0)
		.filter(s => (filterIds ? filterIds.includes(s.song.id || '') : true))
		.sort((a, b) => totalSkips(b.playlists) - totalSkips(a.playlists))
		.map(({ song, ...entry }, i, { length }) => {
			const playlistsSkips = entry.playlists
				?.slice()
				.filter(p => (countNonPlaylists ? findPlaylist(p.uri, playlists, user) : true))

			if (allPlaylists)
				playlistsSkips.push(
					...playlists
						.filter(pl => playlistsSkips.some(s => s.uri !== pl.uri))
						.filter(pl => pl.tracks.items[song.id || ''] !== undefined)
						.map(pl => ({ plays: 0, skips: 0, name: pl.name, uri: pl.uri }))
				)

			playlistsSkips.sort((a, b) => b.skips - a.skips)

			return (
				<li key={song.uri} className={cn('py-2', { 'border-b border-b-gray-300': i < length - 1 })}>
					<div className="grid grid-rows-2 grid-cols-[auto,3fr,2fr,1fr] items-center space-x-2 border-b border-b-gray-600 p-2">
						<UriLink object={song.album} className="row-span-2 space-x-2">
							<img className="inline h-12" src={song.album?.images?.[0]?.url} />
						</UriLink>
						<UriLink object={song} className="col-start-2 row-start-1" />
						<UriLink object={song.album} className="col-start-2 row-start-2 ellipsis opacity-60" />

						{song.artists && (
							<ArtistLinks
								artists={song.artists}
								className="col-start-3 row-span-2 justify-self-center"
							/>
						)}

						<span className="col-start-4 row-span-2 justify-self-end">
							Total skips: {totalSkips(entry.playlists)}
						</span>
					</div>
					<ul className="p-2">
						{entry.playlists.map(playlist => (
							<li key={playlist.uri} className="flex justify-between">
								<span className="space-x-4">
									{(playlist.uri as string) !== 'unknown' && playlist.id ? (
										<>
											<UriLink object={playlist} />
											<button
												className="opacity-80 hover:opacity-100"
												onClick={_ =>
													dispatch(
														Actions.deleteTracks([song.uri], {
															id: playlist.id as string,
															snapshot_id: playlist.snapshot_id as string
														})
													)
												}
											>
												Remove song from this list
											</button>
										</>
									) : (
										<span>Unknown playlist</span>
									)}
								</span>
								<span className="space-x-1">
									<SkipStats skips={playlist.skips} plays={playlist.plays} />
								</span>
							</li>
						))}
					</ul>
				</li>
			)
		})
	return <>{retval}</>
}
