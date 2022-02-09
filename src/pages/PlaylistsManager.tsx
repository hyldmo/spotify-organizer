import React from 'react'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import Button from '../components/Button'
import Input from '../components/Input'
import Playlists from '../components/Playlists'
import PullPlaylist from '../components/PullPlaylist'
import { OperationMode, Playlist, State as ReduxState } from 'types'
import { applyPlaylistsFilters, CompareType, getDeduplicateErrors } from '../utils'
import Modal from '../containers/Modal'
import Settings from '../containers/Settings'

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

type Props = ReturnType<typeof mapStateToProps> & typeof dispatchToProps

type State = {
	mode: OperationMode
	compareType: CompareType | null
	secondPlaylist: Playlist | null
}

class PlaylistsManager extends React.Component<Props, State> {
	state: State = {
		mode: OperationMode.None,
		compareType: null,
		secondPlaylist: null
	}

	changeMode(mode: OperationMode) {
		this.setState({ mode })
	}

	handleInputChange(event: React.FormEvent<HTMLInputElement>) {
		const target = event.currentTarget
		if (target.type === 'checkbox') {
			this.setState({
				mode: target.checked ? OperationMode.PullTracks : OperationMode.Duplicates
			})
		}
	}

	render() {
		const { filters, select, selectAll, changeSortMode, updateFilterText, user, deduplicate } = this.props
		const { mode, compareType, secondPlaylist } = this.state
		if (user === null) return
		const playlists = applyPlaylistsFilters(this.props.playlists, filters, user)
		const selectedPlaylists = playlists.filter(p => p.selected)

		const error = getDeduplicateErrors(mode, selectedPlaylists, secondPlaylist, user)

		return (
			<div className="manager bg-inherit">
				<div className="sticky top-0 pt-2 pb-3 px-4 z-10 space-y-2 bg-inherit border-b border-b-gray-600">
					<div className="header row ">
						<h2>Playlists</h2>
						<input
							type="text"
							placeholder="&#xF002; Filter"
							onChange={e => updateFilterText(e.target.value)}
						/>
						<span className="filler" />

						<Modal id="settings" centered component={<Button icon="cog" />}>
							<Settings />
						</Modal>
					</div>
					<div className="row space-x-2">
						{mode !== OperationMode.None ? (
							<>
								<Button onClick={_ => this.changeMode(OperationMode.None)}>Cancel</Button>
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
								onClick={_ => this.changeMode(OperationMode.Duplicates)}
								title={error || ''}
							>
								Remove duplicates
							</Button>
						)}
						<span className="filler" />
						<ul className="stats right-menu flex gap-2">
							<li>{playlists.length} Playlists</li>
							<li>{playlists.reduce((a, b) => a + b.tracks.total, 0)} Tracks</li>
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
											onChange={() => this.setState({ compareType: key as CompareType })}
										/>
									))}
								<Input
									name="advanced"
									type="checkbox"
									label="From another playlist"
									onChange={e => this.handleInputChange(e)}
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
						onPlaylistSelect={id => this.setState({ secondPlaylist: id })}
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
}

export function getCompareTypeExplanation(compareType: CompareType): Exclude<React.ReactNode, undefined> {
	const Mark: React.FC = props => <strong className="not-italic" {...props} />
	switch (compareType) {
		case CompareType.SongId:
			return (
				<>
					Mark songs as duplicate when the other song has the same <Mark>ID</Mark>
				</>
			)

		case CompareType.Name:
			return (
				<>
					Mark songs as duplicate when the other song has the same <Mark>Name</Mark>
				</>
			)

		case CompareType.NameAndAlbum:
			return (
				<>
					Mark songs as duplicate when the other song has the same&nbsp;
					<Mark>Name</Mark> and is from the same <Mark>Album</Mark>
				</>
			)

		case CompareType.NameAndDuration:
			return (
				<>
					Mark songs as duplicate when the other song has the same <Mark>Name</Mark> and <Mark>Length</Mark>
				</>
			)
	}
}

export default connect(mapStateToProps, dispatchToProps)(PlaylistsManager)
