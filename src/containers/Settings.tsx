import React from 'react'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import { State } from '../types'

const mapStateToProps = (state: State) => ({
	filters: state.filters.playlists
})

const dispatchToProps = {
	hideEmpty: Actions.updateHideEmptyFilter,
	updateOwned: Actions.updateOwnedFilter
}

type Props = ReturnType<typeof mapStateToProps> & typeof dispatchToProps

class Settings extends React.Component<Props> {
	render() {
		const { filters, hideEmpty, updateOwned } = this.props

		return (
			<ul>
				<li>
					<label className="flex items-center gap-x-2">
						<input
							type="checkbox"
							checked={filters.hideEmpty}
							onChange={e => hideEmpty(e.target.checked)}
						/>
						<span>Hide empty playlists</span>
					</label>
				</li>
				<li>
					<label className="flex items-center gap-x-2">
						<input
							type="checkbox"
							checked={filters.ownedOnly}
							onChange={e => updateOwned(e.target.checked)}
						/>{' '}
						<span>Show only own playlists</span>
					</label>
				</li>
			</ul>
		)
	}
}

export default connect(mapStateToProps, dispatchToProps)(Settings)
