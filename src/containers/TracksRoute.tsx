import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { RouteComponentProps, withRouter } from 'react-router'
import { replace } from 'react-router-redux'

import { Actions } from '../actions'
import Loading from '../components/Loading'
import Tracks from '../components/Tracks'
import { State as ReduxState } from '../reducers'
import { Duration } from '../utils'

import '../styles/playlists.pcss'

const mapStateToProps = (state: ReduxState) => ({
	playlists: state.playlists
})
const stateProps = returntypeof(mapStateToProps)

const dispatchToProps = {
	fetchTracks: Actions.fetchTracks,
	replace
}

type Props = typeof stateProps & typeof dispatchToProps & RouteComponentProps<{ id: string, user: string }>

class TracksRoute extends React.Component<Props> {
	componentWillMount () {
		const { fetchTracks, match } = this.props
		fetchTracks({ id: match.params.id, owner: match.params.user })
	}

	render () {
		const { match, playlists } = this.props
		const playlist = playlists.find(p => p.id === match.params.id)
		if (playlist === undefined || playlist.tracks.items === undefined)
			return <Loading />

		const tracks = playlist.tracks.items
		const duration = tracks.reduce((a, b) => a + b.duration_ms, 0)
		return (
			<div className="manager tracks">
				<div className="header row">
					<h1>{playlist.name}</h1>
					<span className="filler" />
					<ul className="stats right-menu">
						<li>{tracks.length} Tracks</li>
						<li>{new Duration(duration).toString()}</li>
					</ul>
				</div>
				<hr />
				<Tracks tracks={tracks} />
			</div>
		)
	}
}


export default withRouter(connect(
	mapStateToProps,
	dispatchToProps
)(TracksRoute) as any)
