import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Actions } from '~/actions'
import type { State } from '~/types'

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
				<li className="mt-2 border-gray-600 border-t pt-2">
					<Link to="/debug" className="text-blue-400 hover:text-blue-300">
						Diagnostics
					</Link>
				</li>
			</ul>
		)
	}
}

export default connect(mapStateToProps, dispatchToProps)(Settings)
