/* eslint-disable radix */
import cn from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Actions } from '~/actions'
import Input from '~/components/Input'
import { State } from '~/types'
import { useFirebase } from '~/utils'
import { ByPlaylist } from './ByPlaylist'
import { ByTrack } from './ByTrack'
import { merge as mergeEntries, toEntries } from './skipUtils'

export const Skips: React.FC = () => {
	const dispatch = useDispatch()
	const [searchParams, setSearchParams] = useSearchParams()
	const [nonPlaylists, countNonPlaylists] = useState(false)
	const [allPlaylists, showAllPlaylists] = useState(false)
	const filterIds = searchParams.get('filterId')?.split(',')
	const groupBy = searchParams.get('groupBy') ?? 'playlist'
	const user = useSelector((s: State) => s.user)
	const plays = useFirebase(`users/${user?.id}/plays/`) || {}
	const skips = useFirebase(`users/${user?.id}/skips/`) || {}
	if (!user) return null

	const playlistSkips = toEntries(mergeEntries(plays, skips))

	return (
		<div className="max-h-full grid grid-rows-[auto,1fr] grid-cols-1">
			<header className={cn('pt-4 px-4', 'grid grid-cols-[auto,auto] gap-x-4 justify-between items-start')}>
				<h2 className="col-start-1 text-2xl self-end">Most skipped songs</h2>
				<ul className="col-start-2 row-span-3">
					<li>
						<Input
							label="Group by playlist"
							className="flex items-center gap-x-2"
							type="checkbox"
							checked={groupBy === 'playlist'}
							onChange={e =>
								setSearchParams(
									{ groupBy: e.target.checked ? 'playlist' : 'track' },
									{ replace: false }
								)
							}
						/>
					</li>
					<li>
						<Input
							label="Hide skips that are not from your playlists"
							className="flex items-center gap-x-2"
							type="checkbox"
							checked={nonPlaylists}
							onChange={e => countNonPlaylists(e.target.checked)}
						/>
					</li>
					<li>
						<Input
							label="Only show playlists you own"
							className="flex items-center gap-x-2"
							type="checkbox"
							checked={allPlaylists}
							onChange={e => showAllPlaylists(e.target.checked)}
						/>
					</li>
					<li>
						<Input
							label="Watch skips"
							className="flex items-center gap-x-2"
							type="checkbox"
							checked={user.settings.watchSkips}
							onChange={e => dispatch(Actions.updateSettings(e.target.checked, 'watchSkips'))}
						/>
					</li>
				</ul>
				<p>
					Keep this app on while listening on Spotify, and it will detect which songs you&apos;re skipping and
					from which playlists.
				</p>
				<Input
					label="Minimum skips"
					labelClassName="col-start-1"
					className={cn(
						'px-1.5 rounded bg-transparent outline-none border-2',
						'border-gray-600 hover:border-gray-400 focus:border-gray-300'
					)}
					type="number"
					min={0}
					value={user.settings.minSkips}
					onChange={e => dispatch(Actions.updateSettings(Number.parseInt(e.target.value), 'minSkips'))}
				/>
				<hr className="mt-4 border-t-2 col-span-2 border-t-gray-300" />
			</header>

			<ul className="overflow-y-scroll px-4">
				{groupBy == 'track' ? (
					<ByTrack
						filterIds={filterIds}
						skipData={playlistSkips}
						countNonPlaylists={nonPlaylists}
						allPlaylists={allPlaylists}
						minSkips={user.settings.minSkips}
					/>
				) : (
					<ByPlaylist
						filterIds={filterIds}
						skipData={playlistSkips}
						countNonPlaylists={nonPlaylists}
						allPlaylists={allPlaylists}
						minSkips={user.settings.minSkips}
					/>
				)}
			</ul>
		</div>
	)
}
