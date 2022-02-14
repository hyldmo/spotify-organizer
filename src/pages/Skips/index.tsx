import cn from 'classnames'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FirebaseUserData, PlaylistSkipEntry, State } from 'types'
import { firebaseGet } from 'utils'
import { merge } from 'lodash/fp'
import { ByTrack } from './ByTrack'
import { ByPlaylist } from './ByPlaylist'
import { findPlaylist } from './skipUtils'

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
