import React, { useMemo, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { Actions } from '~/actions'
import Button from '~/components/Button'
import Input from '~/components/Input'
import Modal from '~/components/Modal'
import Playlists from '~/components/Playlists'
import PullPlaylist from '~/components/PullPlaylist'
import Settings from '~/components/Settings'
import { OperationMode, Playlist, State as ReduxState } from '~/types'
import {
	applyPlaylistsFilters,
	CompareType,
	Duration,
	getCompareTypeExplanation,
	getDeduplicateErrors,
	songEntriesToSongs,
	useMapDispatch
} from '~/utils'

const mapStateToProps = (state: ReduxState) => ({
	playlists: state.playlists,
	filters: state.filters.playlists,
	user: state.user
})

const dispatchToProps = {
	selectAll: Actions.selectPlaylists,
	select: Actions.selectPlaylist,
	changeSortMode: Actions.updatePlaylistsSort,
	updateFilterText: Actions.updateFilterText,
	deduplicate: Actions.deduplicatePlaylists
}

const PlaylistsManager: React.FC = () => {
	const [mode, setMode] = useState(OperationMode.None)
	const [compareType, setCompareType] = useState<CompareType | null>(null)
	const [secondPlaylist, setSecondPlaylist] = useState<Playlist | null>(null)
	const { filters, user, playlists: allPlaylists } = useSelector(mapStateToProps)
	const { select, selectAll, changeSortMode, updateFilterText, deduplicate } = useMapDispatch(dispatchToProps)
	const playlists = applyPlaylistsFilters(allPlaylists, filters, user)
	const selectedPlaylists = playlists.filter(p => p.selected)

	const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
		const target = event.currentTarget
		if (target.type === 'checkbox') {
			setMode(target.checked ? OperationMode.PullTracks : OperationMode.Duplicates)
		}
	}

	const totalDuration = useMemo(
		() =>
			playlists.reduce((a, b) => {
				const tracks = songEntriesToSongs(b.tracks.items)
				const actualLength = tracks.reduce((c, d) => c + d.duration_ms, 0)
				return a + (actualLength || b.tracks.total * 3 * 60 * 1000)
			}, 0),
		[playlists]
	)

	if (!user) return null

	const error = getDeduplicateErrors(mode, selectedPlaylists, secondPlaylist, user)

	return (
		<div className="manager bg-inherit">
			<div className="sticky top-0 pt-2 pb-3 px-4 z-10 space-y-2 bg-inherit border-b border-b-gray-600">
				<div className="header row ">
					<h2>Playlists</h2>
					<input type="text" placeholder="&#xF002; Filter" onChange={e => updateFilterText(e.target.value)} />
					<span className="filler" />

					<Modal id="settings" centered component={<Button icon="cog" />}>
						<Settings />
					</Modal>
				</div>
				<div className="row space-x-2">
					{mode !== OperationMode.None ? (
						<>
							<Button onClick={_ => setMode(OperationMode.None)}>Cancel</Button>
							<Button
								primary
								disabled={error !== null}
								title={error || ''}
								onClick={_ =>
									compareType &&
									deduplicate(
										{ source: playlists.filter(pl => pl.selected), target: secondPlaylist },
										compareType
									)
								}
							>
								Confirm
							</Button>
						</>
					) : (
						<Button
							primary
							disabled={compareType !== null && selectedPlaylists.length === 0}
							onClick={_ => setMode(OperationMode.Duplicates)}
							title={error || ''}
						>
							Remove duplicates
						</Button>
					)}
					<span className="filler" />
					<ul className="stats right-menu flex gap-3 max-w-sm">
						<li>{playlists.length} Playlists</li>
						<li>{playlists.reduce((a, b) => a + b.tracks.total, 0)} Tracks</li>
						{totalDuration && <li>{new Duration(totalDuration).toString('hours')}</li>}
					</ul>
				</div>
				{mode !== OperationMode.None && (
					<form className="space-y-1 leading-normal">
						<div>
							<strong>Select duplicate criteria</strong>
							<em className="text-sm">&nbsp;(tracks are always compared by song ID and Artist)</em>
						</div>
						<div className="space-x-3">
							{Object.keys(CompareType)
								.filter(key => isNaN(Number(key)))
								.map(key => (
									<Input
										key={key}
										name="comparetype"
										type="radio"
										value={key}
										checked={compareType === key}
										label={key.replace(/([A-Z])/g, ' $1').trimLeft()}
										onChange={() => setCompareType(key as CompareType)}
									/>
								))}
							<Input
								name="advanced"
								type="checkbox"
								label="From another playlist"
								onChange={handleInputChange}
							/>
						</div>
						<p className="text-sm italic">{compareType && getCompareTypeExplanation(compareType)}</p>
						{mode === OperationMode.PullTracks && (
							<p className="text-sm italic space-x-1">
								<span>Find songs in</span>
								<span className="not-italic font-bold">
									{selectedPlaylists
										.slice(0, 5)
										.map(pl => pl.name)
										.join(', ')}
									,
								</span>
								<span>that also exists in</span>
								<strong className="not-italic">
									{secondPlaylist ? secondPlaylist.name : '<target playlist>'}
								</strong>
								<span>and remove them from</span>
								<strong className="not-italic">
									{secondPlaylist ? secondPlaylist.name : '<target playlist>'}
								</strong>
							</p>
						)}
					</form>
				)}
			</div>
			{mode === OperationMode.PullTracks ? (
				<PullPlaylist
					user={user}
					filters={filters}
					select={select}
					selectAll={selectAll}
					playlists={playlists}
					onPlaylistSelect={id => setSecondPlaylist(id)}
				/>
			) : (
				<Playlists
					changeSortMode={changeSortMode}
					filters={filters}
					select={select}
					selectAll={selectAll}
					playlists={playlists}
				/>
			)}
		</div>
	)
}

export default connect(mapStateToProps, dispatchToProps)(PlaylistsManager)
