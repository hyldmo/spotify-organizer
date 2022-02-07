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
	compareType: CompareType
	secondPlaylist: Playlist | null
}

class PlaylistsManager extends React.Component<Props, State> {
	state = {
		mode: OperationMode.None,
		compareType: CompareType.SongId,
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
		const removeTracks = mode === OperationMode.Duplicates || mode === OperationMode.PullTracks

		const error = getDeduplicateErrors(mode, selectedPlaylists, secondPlaylist, user)

		return (
			<div className="manager bg-inherit">
				<div className="sticky top-0 pt-2 pb-3 px-4 z-10 bg-inherit border-b border-b-gray-600">
					<div className="header row ">
						<h1>Playlists</h1>
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
					<div className="row">
						{removeTracks ? (
							<>
								<Button onClick={_ => this.changeMode(OperationMode.None)}>Cancel</Button>
								<Button
									primary
									disabled={error !== null}
									title={error || ''}
									onClick={_ =>
										removeTracks &&
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
								disabled={selectedPlaylists.length === 0}
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
					{removeTracks && (
						<div className="row">
							<form className="horizontal">
								<div className="row">
									<strong>Select duplicate criteria</strong>
									<em>&nbsp;(tracks are always compared by song id and artist)</em>
								</div>
								<div className="row">
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
							</form>
						</div>
					)}
				</div>
				{mode !== OperationMode.PullTracks ? (
					<Playlists
						changeSortMode={changeSortMode}
						filters={filters}
						select={select}
						selectAll={selectAll}
						playlists={playlists}
					/>
				) : (
					<PullPlaylist
						user={user}
						filters={filters}
						select={select}
						selectAll={selectAll}
						playlists={playlists}
						onPlaylistSelect={id => this.setState({ secondPlaylist: id })}
					/>
				)}
			</div>
		)
	}
}

export default connect(mapStateToProps, dispatchToProps)(PlaylistsManager)
