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

import '../styles/tracks.pcss'

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
		if (playlist === undefined)
			return <Loading />
		if (playlist.tracks.loaded < playlist.tracks.total || playlist.tracks.items === undefined)
			return <Loading progress={{ current: playlist.tracks.loaded, total: playlist.tracks.total }} />


		const tracks = playlist.tracks.items
		const duration = tracks.reduce((a, b) => a + b.duration_ms, 0)
		return (
			<div className="manager tracks">
				<div className="header row">
					{playlist.images.length > 0
						? <img src={playlist.images.reduce((a, b) => (a.height || 0 > (b.height || 0)) ? a : b).url} />
						: null}
					<div className="info">
						{playlist.collaborative && <p><strong>Collaborative Playlist</strong></p>}
						<h1>{playlist.name}</h1>
						<p>TODO: Fetch description{playlist.description}</p>
						<p>Created by: <strong>{playlist.owner.display_name || playlist.owner.id}</strong></p>
					</div>
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
