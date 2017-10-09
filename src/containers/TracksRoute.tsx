import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { RouteComponentProps } from 'react-router'
import { replace } from 'react-router-redux'

import { Actions } from '../actions'
import ErrorBoundary from '../components/ErrorBoundary'
import Tracks from '../components/Tracks'
import { State as ReduxState } from '../reducers'
import { durationString } from '../utils/duration'

import '../styles/playlists.pcss'

const mapStateToProps = (state: ReduxState) => ({
	playlists: state.playlists,
	filters: state.filters.playlists,
	user: state.user
})
const stateProps = returntypeof(mapStateToProps)

const dispatchToProps = {
	fetchTracks: Actions.fetchTracks,
	replace
}

type Props = typeof stateProps & typeof dispatchToProps & RouteComponentProps<{ id: string }>

class TracksRoute extends React.Component<Props> {
	componentDidMount () {
		const { fetchTracks, match, user } = this.props
		fetchTracks({ id: match.params.id, owner: user.name })
	}

	render () {
		const { match, playlists } = this.props
		const playlist = playlists.find(p => p.id === match.params.id)
		const tracks = playlist === undefined || playlist.tracks.items === undefined ? [] : playlist.tracks.items
		const duration = durationString(tracks.reduce((a, b) => a + b.duration_ms, 0))

		return (
			<ErrorBoundary>
				<div className="tracks">
					<div className="header">
						<h1>{playlist.name}</h1>
					</div>
					<ul className="stats right-menu">
						<li>{tracks.length} Tracks</li>
						<li>{duration}</li>
					</ul>
					<hr />
					<Tracks tracks={tracks} />
				</div>
			</ErrorBoundary>
		)
	}
}


export default connect(
	mapStateToProps,
	dispatchToProps
)(TracksRoute)
