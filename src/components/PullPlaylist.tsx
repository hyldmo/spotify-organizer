import * as React from 'react'
import { Actions } from '../actions'
import Highlight from '../components/Highlight'
import { initialState, playlists as updateFilters } from '../reducers/filters'
import { Filters as PlaylistFilters, Playlist } from '../types'
import { applyPlaylistsFilters, getNextSortMode, getSortIcon } from '../utils'

const headers = [
	['Name', 'name'],
	['Owner', 'owner.display_name'],
	['Tracks', 'tracks.total']
]

type Filters = PlaylistFilters['playlists']

type Props = {
	playlists: Playlist[]
	filters?: Filters
	selectAll: typeof Actions.selectPlaylists
	select: typeof Actions.selectPlaylist
}

type State = {
	playlistToRemoveFrom: string | null
	aFilters: Filters
	bFilters: Filters
}

class PullPlaylist extends React.Component<Props, State> {
	state = {
		playlistToRemoveFrom: null,
		aFilters: this.props.filters || initialState.playlists,
		bFilters: initialState.playlists
	}

	updateAFilters (action: any) {
		const newState = updateFilters(this.state.aFilters, action)
		this.setState({ aFilters: newState })
	}
	updateBFilters (action: any) {
		const newState = updateFilters(this.state.bFilters, action)
		this.setState({ bFilters: newState })
	}

	render () {
		const { playlists, select, selectAll } = this.props
		const { aFilters, bFilters } = this.state
		const aPlaylists = applyPlaylistsFilters(playlists, aFilters)
		const bPlaylists = applyPlaylistsFilters(playlists, bFilters)
		return (
			<div className="playlists-compare">
				<div className="playlists">
					<table>
						<thead>
							<tr>
								<th className="select"><input type="checkbox" onChange={e => selectAll(e.target.checked)}/></th>
								<th className="image"></th>
								{headers.map(([name, key]) => (
									<th key={name} >
										<a onClick={() => this.updateAFilters(Actions.updatePlaylistsSort(getNextSortMode(aFilters.order.key === key, aFilters.order.mode), key))}>
											{name}
										</a>
										&nbsp;{getSortIcon(aFilters.order.key === key, aFilters.order.mode)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{aPlaylists.map(p =>
								<tr key={p.id}>
									<td>
										<input type="checkbox" checked={p.selected} onChange={e => select(e.target.checked, p.id)} />
									</td>
									<td className="images">
										{p.images.length > 0 ? <img src={p.images.slice().sort(i => i.height as number)[0].url} /> : null}
									</td>
									<td>
										<Highlight text={p.name} term={aFilters.text} />
									</td>
									<td>
										<Highlight text={p.owner.display_name || p.owner.id} term={aFilters.text} />
									</td>
									<td>
										{p.tracks.total}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<div className="playlists">

					<table>
						<thead>
							<tr>
								<th className="select" />
								<th className="image" />
								{headers.map(([name, key]) => (
									<th key={name} >
										<a onClick={e => this.updateBFilters(Actions.updatePlaylistsSort(getNextSortMode(bFilters.order.key === key, bFilters.order.mode), key))}>
											{name}
										</a>
										&nbsp;{getSortIcon(bFilters.order.key === key, bFilters.order.mode)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{bPlaylists.map(p =>
								<tr key={p.id}>
									<td>
										<input type="radio" name="playlist" value={p.id} onChange={() => this.setState({ playlistToRemoveFrom: p.id })} />
									</td>
									<td className="images">
										{p.images.length > 0 ? <img src={p.images.slice().sort(i => i.height as number)[0].url} /> : null}
									</td>
									<td>
										<Highlight text={p.name} term={bFilters.text} />
									</td>
									<td>
										<Highlight text={p.owner.display_name || p.owner.id} term={bFilters.text} />
									</td>
									<td>
										{p.tracks.total}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		)
	}
}

export default PullPlaylist
