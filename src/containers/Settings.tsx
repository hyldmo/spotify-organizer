import React from 'react'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import { State } from '../reducers'

const mapStateToProps = (state: State) => ({
	filters: state.filters.playlists
})

const dispatchToProps = {
	hideEmpty: Actions.updateHideEmptyFilter,
	updateOwned: Actions.updateOwnedFilter
}

type Props = ReturnType<typeof mapStateToProps> & typeof dispatchToProps

class Settings extends React.Component<Props> {

	render () {
		const { filters, hideEmpty, updateOwned } = this.props

		return (
			<ul className="settings">
				<li><input type="checkbox" checked={filters.hideEmpty} onChange={e => hideEmpty(e.target.checked)} /> Hide empty playlists </li>
				<li><input type="checkbox" checked={filters.ownedOnly} onChange={e => updateOwned(e.target.checked)} /> Show only own playlists</li>
			</ul>
		)
	}
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Settings)
