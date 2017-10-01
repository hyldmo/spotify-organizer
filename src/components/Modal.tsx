import * as React from 'react'

import '../styles/modal.pcss'

type Props = {
	initialOpen?: boolean
}

type State = {
	open: boolean
}

export default class Modal extends React.Component<Props, State> {
	constructor (props) {
		super(props)

		const { initialOpen = false } = this.props
		this.state = { open: initialOpen }
	}

	render () {
		return this.state.open
			? (
				<div className="modal">
					<div className="overlay" onClick={e => this.setState({ open: false })} />
					<div className="content">
						{this.props.children}
					</div>
				</div>
			)
			: null
	}
}
