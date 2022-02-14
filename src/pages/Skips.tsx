import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FirebaseUserData, Nullable, PlaylistSkipEntry, SkipEntry, SkipEntryPlaylist, State, Track, User } from 'types'
import { ArtistLinks, UriLink } from 'components/UriLink'
import { Actions } from 'actions'
import { firebaseGet, idToUri, UriToId } from 'utils'
import memoizee from 'memoizee'
import { merge } from 'lodash/fp'

const findPlaylist = memoizee((uri: string, playlists: State['playlists'], owner?: Nullable<User>) =>
	playlists.find(pl => pl.uri == uri && (owner ? pl.owner.id == owner.id : true))
)

const findSong = memoizee((id: Track['id'], playlists: State['playlists']) => {
	for (const playlist of playlists) {
		const track = playlist.tracks?.items?.find(t => t.id == id)
		if (track) return track
	}
	return undefined
})

const findPlays = memoizee((id: Track['id'], playlist: PlaylistSkipEntry) => {
	const track = playlist.songs?.find(t => t.id == id)
	if (track) return { ...track, plays: track.plays || 0, skips: track.skips || 0 }
	return { id, plays: 0, skips: 0 }
})

type GroupBy = 'playlist' | 'track'

export const Skips: React.FC = () => {
	const [nonPlaylists, countNonPlaylists] = useState(true)
	const [allPlaylists, showAllPlaylists] = useState(false)
	const [groupBy, setGroupBy] = useState<GroupBy>('playlist')
	const [playlistSkips, setSkips] = useState<PlaylistSkipEntry[]>([])
	const playlists = useSelector((s: State) => s.playlists)
	const user = useSelector((s: State) => s.user)

	useEffect(() => {
		function toEntries<K extends 'skips' | 'plays'>(entries: FirebaseUserData[K] | FirebaseUserData[K], key: K) {
			return Object.entries(entries).map(([playlistUri, songs]) => {
				const playlist = findPlaylist(playlistUri, playlists) || {
					uri: playlistUri as PlaylistSkipEntry['uri']
				}
				return {
					...playlist,
					songs: Object.entries(songs).map(([songId, value]) => ({
						id: songId,
						[key]: value
					}))
				}
			})
		}
		async function fetchData() {
			if (!user) return
			const playData = await firebaseGet(`users/${user.id}/plays/`)
			const skipData = await firebaseGet(`users/${user.id}/skips/`)
			const entries = merge(
				playData ? toEntries(playData, 'plays') : [],
				skipData ? toEntries(skipData, 'skips') : []
			)
			setSkips(Object.values(entries))
		}
		fetchData()
	}, [user, playlists])

	return (
		<div className="max-h-full grid grid-rows-[auto,1fr] grid-cols-1">
			<header className={cn('pt-4 px-4', 'grid grid-cols-[auto,auto] gap-x-4 justify-between items-end')}>
				<h2 className="col-start-1 text-2xl self-end">Most skipped songs</h2>
				<ul className="col-start-2 row-span-2">
					<li>
						<label className="flex items-center gap-x-2">
							<input
								type="checkbox"
								checked={nonPlaylists}
								onChange={e => countNonPlaylists(e.target.checked)}
							/>
							Hide skips that are not from your playlists
						</label>
					</li>
					<li>
						<label className="flex items-center gap-x-2">
							<input
								type="checkbox"
								checked={allPlaylists}
								onChange={e => showAllPlaylists(e.target.checked)}
							/>
							Show all playlists the songs belong to
						</label>
					</li>
					<li>
						<label className="flex items-center gap-x-2">
							<input
								type="checkbox"
								checked={groupBy === 'playlist'}
								onChange={e => setGroupBy(e.target.checked ? 'playlist' : 'track')}
							/>
							Group by playlist
						</label>
					</li>
				</ul>
				<p>
					Keep this app on while listening on Spotify, and it will detect which songs you&apos;re skipping and
					from which playlists.
				</p>
				<hr className="mt-4 border-t-2 col-span-2 border-t-gray-300" />
			</header>

			<ul className="overflow-y-scroll px-4">
				{groupBy == 'track' ? (
					<ByTrack skipData={playlistSkips} countNonPlaylists={nonPlaylists} allPlaylists={allPlaylists} />
				) : (
					<ByPlaylist skipData={playlistSkips} countNonPlaylists={nonPlaylists} allPlaylists={allPlaylists} />
				)}
			</ul>
		</div>
	)
}

type Props = {
	countNonPlaylists: boolean
	allPlaylists: boolean
	skipData: PlaylistSkipEntry[]
}

const countSkips = (playlist: PlaylistSkipEntry) => playlist.songs.reduce((a, b) => a + (b.skips || 0), 0)

const ByPlaylist: React.FC<Props> = ({ skipData, countNonPlaylists, allPlaylists }) => {
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
				<ul className="p-2">
					{playlist.songs
						.filter(song => song.skips)
						.map(({ id, skips = 0, plays = 0 }) => {
							const song = playlist.tracks?.items?.find(s => s.id == id)
							const uri = song?.uri || idToUri(id, 'track')
							return (
								<li key={id} className="flex justify-between">
									<span className="space-x-4">
										{playlist.owner?.id == user?.id && (
											<button
												className="opacity-40 hover:opacity-80"
												onClick={_ =>
													dispatch(
														Actions.deleteTracks(
															[idToUri(id, 'track')],
															UriToId(playlist.uri)
														)
													)
												}
											>
												<FontAwesomeIcon icon="trash-alt" size="xs" aria-hidden="true" />
											</button>
										)}
										<a href={uri}>{song?.name || uri}</a>
									</span>
									{plays == 1 ? (
										<span className="opacity-70 space-x-1">
											<span>{skips} skips</span>
											<span>/</span>
											<span>{plays} plays</span>
										</span>
									) : (
										<span className="opacity-70 space-x-1">
											<span>Skipped:</span>
											<span>{Math.min(100, Math.round((skips / plays) * 100))}%</span>
										</span>
									)}
								</li>
							)
						})}
				</ul>
			</li>
		))
	return <>{retval}</>
}

const ByTrack: React.FC<Props> = ({ skipData, countNonPlaylists, allPlaylists }) => {
	const dispatch = useDispatch()
	const playlists = useSelector((s: State) => s.playlists)
	const user = useSelector((s: State) => s.user)

	const songSkips = useMemo(() => {
		const songIds = new Set(skipData.flatMap(a => a.songs.map(s => s.id)))
		return Array.from(songIds).map<SkipEntry>(id => {
			const song = findSong(id, playlists) || { uri: idToUri(id, 'track') }
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
		.sort((a, b) => totalSkips(b.playlists) - totalSkips(a.playlists))
		.map(({ song, ...entry }, i, { length }) => {
			const playlistsSkips = entry.playlists
				?.slice()
				.filter(p => (countNonPlaylists ? findPlaylist(p.uri, playlists, user) : true))

			if (allPlaylists)
				playlistsSkips.push(
					...playlists
						.filter(pl => playlistsSkips.some(s => s.uri !== pl.uri))
						.filter(pl => pl.tracks.items?.find(track => track.id == song.id))
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
											{playlist.owner?.id == user?.id && (
												<button
													className="opacity-80 hover:opacity-100"
													onClick={_ =>
														dispatch(
															Actions.deleteTracks([song.uri], playlist.id as string)
														)
													}
												>
													Remove song from this list
												</button>
											)}
										</>
									) : (
										<span>Unknown playlist</span>
									)}
								</span>
								<span className="opacity-70">Skips: {playlist.skips}</span>
							</li>
						))}
					</ul>
				</li>
			)
		})
	return <>{retval}</>
}
