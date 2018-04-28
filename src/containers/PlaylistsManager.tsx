import * as React from 'react'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import Button from '../components/Button'
import Input from '../components/Input'
import Playlists from '../components/Playlists'
import PullPlaylist from '../components/PullPlaylist'
import { State } from '../reducers'
import { OperationMode } from '../types/index'
import { applyPlaylistsFilters, canModifyPlaylist, CompareType } from '../utils'
import Modal from './Modal'
import Settings from './Settings'

const mapStateToProps = (state: State) => ({
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

class PlaylistsManager extends React.Component<Props> {
	state = {
		mode: OperationMode.None,
		compareType: CompareType.SongId,
		secondPlaylist: null
	}

	changeMode (mode: OperationMode) {
		this.setState({ mode })
	}

	handleInputChange (event: React.FormEvent<HTMLInputElement>) {
		const target = event.currentTarget
		if (target.type === 'checkbox') {
			this.setState({
				mode: target.checked
					? OperationMode.PullTracks
					: OperationMode.Duplicates
			})
		}
	}

	render () {
		const { filters, select, selectAll, changeSortMode, updateFilterText, user, deduplicate } = this.props
		const { mode, compareType, secondPlaylist } = this.state
		if (user === null)
			return
		const playlists = applyPlaylistsFilters(this.props.playlists, filters, user)
		const disabled = playlists.filter(p => p.selected).length === 0
		const removeTracks = mode === OperationMode.Duplicates || mode === OperationMode.PullTracks
		return (
			<div className="manager">
				<div className="header row">
					<h1>Playlists</h1>
					<input type="text" placeholder="&#xF002; Filter" onChange={e => updateFilterText(e.target.value)} />
					<span className="filler" />

					<Modal id="settings" component={<Button icon="cog" />}>
						<Settings />
					</Modal>
				</div>
				<div className="row">
					{removeTracks ? <>
						<Button onClick={e => this.changeMode(OperationMode.None)}>
							Cancel
						</Button>
						<Button primary
							disabled={disabled || mode === OperationMode.PullTracks
								? secondPlaylist === null
								: playlists.every(pl => canModifyPlaylist(pl, user))}
							onClick={e => removeTracks && deduplicate({ source: playlists.filter(pl => pl.selected), target: secondPlaylist }, compareType)}
						>
							Confirm
						</Button>
					</> :
						<Button primary disabled={disabled} onClick={e => this.changeMode(OperationMode.Duplicates)}>
							Remove duplicates
						</Button>
					}
					<span className="filler" />
					<ul className="stats right-menu">
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
								{Object.keys(CompareType).filter(key => isNaN(Number(key))).map(key =>
									<Input key={key} name="comparetype" type="radio" value={key} onClick={() => this.setState({ compareType: key })}
										label={key.replace(/([A-Z])/g, ' $1').trimLeft()}
									/>
								)}
								<Input name="advanced" type="checkbox" label="From another playlist"
									onChange={e => this.handleInputChange(e)}
								/>
							</div>
						</form>
					</div>
				)}
				<hr />
				{mode !== OperationMode.PullTracks
					? <Playlists
						changeSortMode={changeSortMode}
						filters={filters}
						select={select}
						selectAll={selectAll}
						playlists={playlists}
					/>
					: <PullPlaylist
						user={user}
						filters={filters}
						select={select}
						selectAll={selectAll}
						playlists={playlists}
						onPlaylistSelect={id => this.setState({ secondPlaylistId: id })}
					/>}
			</div>
		)
	}
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(PlaylistsManager)
