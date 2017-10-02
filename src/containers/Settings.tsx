import * as React from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'

import '../styles/settings.pcss'

export default class Settings extends React.Component<{}, { settingsOpen: boolean }> {
	state = {
		settingsOpen: false
	}

	render () {
		const { settingsOpen } = this.state

		return (
			<div className="right-menu">
				<Button icon="cog" onClick={() => this.setState({ settingsOpen: true })} />
				<Modal open={settingsOpen} onClose={() => this.setState({ settingsOpen: false })}>
					<ul className="settings">
						<li><input type="checkbox" /> Hide empty playlists </li>
						<li><input type="checkbox" /> Show only own playlists </li>
					</ul>
				</Modal>
			</div>

		)
	}
}
