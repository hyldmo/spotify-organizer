import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Actions } from '../actions'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { State } from '../reducers'

import '../styles/settings.pcss'

const mapStateToProps = (state: State) => ({
	filters: state.filters.playlists
})
const stateProps = returntypeof(mapStateToProps)

const dispatchToProps = {
	hideEmpty: Actions.updateHideEmptyFilter,
	updateOwned: Actions.updateOwnedFilter
}

type Props = typeof stateProps & typeof dispatchToProps

class Settings extends React.Component<Props, { settingsOpen: boolean }> {
	state = {
		settingsOpen: false
	}

	render () {
		const { settingsOpen } = this.state
		const { filters, hideEmpty, updateOwned } = this.props

		return (
			<div className="right-menu">
				<Button icon="cog" onClick={() => this.setState({ settingsOpen: true })} />
				<Modal open={settingsOpen} onClose={() => this.setState({ settingsOpen: false })}>
					<ul className="settings">
						<li><input type="checkbox" checked={filters.hideEmpty} onChange={e => hideEmpty(e.target.checked)} /> Hide empty playlists </li>
						<li><input type="checkbox" checked={filters.ownedOnly} onChange={e => updateOwned(e.target.checked)} /> Show only own playlists</li>
					</ul>
				</Modal>
			</div>
		)
	}
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Settings)
