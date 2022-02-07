import React from 'react'
import { Actions } from '../actions'
import { initialState, playlists as updateFilters } from '../reducers/filters'
import { Playlist, Filters as PlaylistFilters, User } from '../types'
import { applyPlaylistsFilters } from '../utils'
import Playlists from './Playlists'

type Filters = PlaylistFilters['playlists']

type Props = {
	user: User
	playlists: Playlist[]
	filters: Filters
	selectAll: typeof Actions.selectPlaylists
	select: typeof Actions.selectPlaylist
	onPlaylistSelect: (playlist: Playlist) => void
}

type State = {
	playlistToRemoveFrom?: Playlist
	aFilters: Filters
	bFilters: Filters
}

class PullPlaylist extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = {
			aFilters: this.props.filters,
			bFilters: initialState.playlists
		}
	}

	updateAFilters(action: any) {
		const newState = updateFilters(this.state.aFilters, action)
		this.setState({ aFilters: newState })
	}
	updateBFilters(action: any) {
		const newState = updateFilters(this.state.bFilters, action)
		this.setState({ bFilters: newState })
	}

	handleRadioClick(id: string) {
		const playlist = this.props.playlists.find(p => p.id === id)
		this.setState({ playlistToRemoveFrom: playlist })
		this.props.onPlaylistSelect(playlist as Playlist)
	}

	render() {
		const { playlists, select, selectAll, user } = this.props
		const { aFilters, bFilters, playlistToRemoveFrom } = this.state
		const aPlaylists = applyPlaylistsFilters(playlists, aFilters).filter(pl =>
			playlistToRemoveFrom ? pl.id !== playlistToRemoveFrom.id : true
		)
		const bPlaylists = applyPlaylistsFilters(playlists, bFilters)
			.filter(
				pl =>
					(pl.collaborative || pl.owner.id === user.name) &&
					!aPlaylists.filter(p => p.selected).some(p => p.id === pl.id)
			)
			.map(pl => ({ ...pl, selected: playlistToRemoveFrom ? pl.id === playlistToRemoveFrom.id : false }))

		return (
			<div className="playlists-compare">
				<Playlists
					playlists={aPlaylists}
					filters={aFilters}
					select={select}
					selectAll={selectAll}
					changeSortMode={(sort, key) => this.updateAFilters(Actions.updatePlaylistsSort(sort, key))}
				/>
				<Playlists
					playlists={bPlaylists}
					filters={bFilters}
					select={(_, p) => this.handleRadioClick(p)}
					changeSortMode={(sort, key) => this.updateBFilters(Actions.updatePlaylistsSort(sort, key))}
				/>
			</div>
		)
	}
}

export default PullPlaylist
