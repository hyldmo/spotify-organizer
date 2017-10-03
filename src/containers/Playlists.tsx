import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Link } from 'react-router-dom'

import * as _ from 'lodash'

import { Actions } from '../actions'
import Button from '../components/Button'
import Input from '../components/Input'
import { State } from '../reducers'
import { compareByKey } from '../utils'

import '../styles/playlists.pcss'

const mapStateToProps = (state: State) => ({
	playlists: state.playlists,
	filters: state.filters.playlists
})

const dispatchToProps = {
	selectAll: Actions.selectPlaylists,
	select: Actions.selectPlaylist,
	changeSortMode: Actions.updatePlaylistsSort,
	updateFilterText: Actions.updateFilterText
}

const headers = [
	['Name', 'name'],
	['Owner', 'owner.display_name'],
	['Tracks', 'tracks.total']
]

const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps & typeof dispatchToProps

const Playlists: React.StatelessComponent<Props> = (props) => {
	const { filters, select, selectAll, changeSortMode, updateFilterText } = props
	const { order } = filters
	const playlists = filters.order !== null
		? props.playlists
			.slice()
			.filter(p => _.includes(p.name, filters.text) || _.includes(p.owner.display_name, filters.text))
			.sort((a, b) => compareByKey(a, b, order.key, !order.asc))
		: props.playlists
	return (
		<div className="playlists">
			<div className="header">
				<h1>Playlists</h1>
				<Input type="text" placeholder="&#xF002; Filter" onChange={(e: any) => updateFilterText(e.target.value)} />
				<div className="right-menu">
					<Button icon="cog" />
				</div>
			</div>
			<Button primary>Remove duplicates</Button>
			<ul className="stats right-menu">
				<li>{playlists.length} Playlists</li>
				<li>{playlists.reduce((a, b) => a + b.tracks.total, 0)} Tracks</li>
			</ul>
			<hr />
			{playlists.length > 0 ? (
				<table className="playlists">
					<thead>
						<tr>
							<th className="select"><input type="checkbox" onChange={e => selectAll(e.target.checked)}/></th>
							<th className="image"></th>
							{headers.map(([name, key]) => (
								<th key={name} >
									<a onClick={e => changeSortMode(order.key === key && !order.asc, key)}>
										{name} { order.key === key ? order.asc ? '↓' : '↑' : ''}
									</a>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{playlists.map(p =>
							<tr key={p.id}>
								<td><input type="checkbox" checked={p.selected} onChange={e => select(e.target.checked, p.id)} /></td>
								<td className="images">{p.images.length > 0 ? <img src={p.images[p.images.length - 1].url} /> : null}</td>
								<td><Link to={`playlists/${p.id}`}>{p.name}</Link></td>
								<td>{p.owner.display_name}</td>
								<td>{p.tracks.total}</td>
							</tr>
						)}
					</tbody>
				</table>
			) : null
			}
		</div>
	)
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Playlists)
