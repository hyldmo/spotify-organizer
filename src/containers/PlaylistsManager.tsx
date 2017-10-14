import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import Modal from './Modal'

import { Actions } from '../actions'
import Button from '../components/Button'
import Input from '../components/Input'
import Playlists from '../components/Playlists'
import { State } from '../reducers'
import { applyPlaylistsFilters } from '../utils'
import Settings from './Settings'

import '../styles/playlists.pcss'

const mapStateToProps = (state: State) => ({
	playlists: state.playlists,
	filters: state.filters.playlists,
	user: state.user
})

const dispatchToProps = {
	selectAll: Actions.selectPlaylists,
	select: Actions.selectPlaylist,
	changeSortMode: Actions.updatePlaylistsSort,
	updateFilterText: Actions.updateFilterText
}

const stateProps = returntypeof(mapStateToProps)

type Props = typeof stateProps & typeof dispatchToProps

const PlaylistsManager: React.StatelessComponent<Props> = (props) => {
	const { filters, select, selectAll, changeSortMode, updateFilterText, user } = props
	const playlists = applyPlaylistsFilters(props.playlists, filters, user)
	return (
		<div className="playlists">
			<div className="header">
				<h1>Playlists</h1>
				<Input type="text" placeholder="&#xF002; Filter" onChange={(e: any) => updateFilterText(e.target.value)} />
				<Settings />
			</div>
			<Modal id="dupes" component={<Button primary>Remove duplicates</Button>}>
				<h1>HELLO</h1>
			</Modal>
			<ul className="stats right-menu">
				<li>{playlists.length} Playlists</li>
				<li>{playlists.reduce((a, b) => a + b.tracks.total, 0)} Tracks</li>
			</ul>
			<hr />
			<Playlists
				changeSortMode={changeSortMode}
				filters={filters}
				select={select}
				selectAll={selectAll}
				playlists={playlists}
			/>
		</div>
	)
}


export default connect(
	mapStateToProps,
	dispatchToProps
)(PlaylistsManager)
