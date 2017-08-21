import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Route, Switch } from 'react-router'
import Footer from '../components/Footer'
import Home from '../components/Home'
import Navbar from '../components/Navbar'
import NotFound from '../components/NotFound'
import { State } from '../reducers'

import Auth from './Auth'

import '../styles/playlists.pcss'

const mapStateToProps = (state: State) => ({
	playlists: state.playlists
})

const dispatchToProps = {
}

const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps & typeof dispatchToProps

const Playlists: React.StatelessComponent<Props> = ({ playlists }) => (
	<div>
		{playlists.length > 0 ? (
			<table className="playlists">
				<thead>
					<tr>
						<th></th>
						<th>Name</th>
						<th>Owner</th>
						<th>Tracks</th>
					</tr>
				</thead>
				<tbody>
					{playlists.map(p =>
						<tr key={p.id}>
							<td className="images">{p.images.length > 0 ? <img src={p.images[p.images.length - 1].url} /> : null}</td>
							<td>{p.name}</td>
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

export default connect(
	mapStateToProps,
	dispatchToProps
)(Playlists)
