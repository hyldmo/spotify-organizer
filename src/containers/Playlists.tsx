import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Link } from 'react-router-dom'
import { State } from '../reducers'


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

export default connect(
	mapStateToProps,
	dispatchToProps
)(Playlists)
