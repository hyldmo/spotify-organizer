import React from 'react'
import { Action, Actions } from '~/actions'
import Highlight from '~/components/Highlight'
import { initialState, playlists as updateFilters } from '~/reducers/filters'
import { Filters as PlaylistFilters, Playlist } from '~/types'
import { applyPlaylistsFilters, getNextSortMode, getSortIcon } from '~/utils'

const headers = [
	['Name', 'name'],
	['Owner', 'owner.display_name'],
	['Tracks', 'tracks.total']
]

type Filters = PlaylistFilters['playlists']

type Props = {
	playlists: Playlist[]
	filters?: Filters
}

type State = {
	selectedPlaylists: string[]
	filters: Filters
}

class PullPlaylist extends React.Component<Props, State> {
	state = {
		selectedPlaylists: [],
		filters: this.props.filters || initialState.playlists
	}
	updateFilters(action: Action) {
		const newState = updateFilters(this.state.filters, action)
		this.setState({ filters: newState })
	}

	selectAll(action: Action) {
		const newState = updateFilters(this.state.filters, action)
		this.setState({ filters: newState })
	}

	render() {
		const { playlists: initialPlaylists } = this.props
		const { filters } = this.state
		const playlists = applyPlaylistsFilters(initialPlaylists, filters)
		return (
			<div className="playlists">
				<table>
					<thead>
						<tr>
							<th className="select">
								<input
									type="checkbox"
									onChange={e => this.updateFilters(Actions.selectPlaylists(e.target.checked))}
								/>
							</th>
							<th className="image"></th>
							{headers.map(([name, key]) => (
								<th key={name}>
									<a
										onClick={() =>
											this.updateFilters(
												Actions.updatePlaylistsSort(
													getNextSortMode(filters.order.key === key, filters.order.mode),
													key
												)
											)
										}
									>
										{name}
									</a>
									&nbsp;{getSortIcon(filters.order.key === key, filters.order.mode)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{playlists.map(p => (
							<tr key={p.id}>
								<td>
									<input
										type="checkbox"
										checked={p.selected}
										onChange={e => select(e.target.checked, p.id)}
									/>
								</td>
								<td className="images">
									{p.images.length > 0 ? (
										<img src={p.images.slice().sort(i => i.height as number)[0].url} />
									) : null}
								</td>
								<td>
									<Highlight text={p.name} term={filters.text} />
								</td>
								<td>
									<Highlight text={p.owner.display_name || p.owner.id} term={filters.text} />
								</td>
								<td>{p.tracks.total}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}
}

export default PullPlaylist
