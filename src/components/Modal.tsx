import * as React from 'react'

import '../styles/modal.pcss'

type Props = {
	open: boolean
	onClose: () => void
}

const Modal: React.StatelessComponent<Props> = ({ onClose, open, children }) => (
	open
	? (
		<div className="modal">
			<div className="overlay" onClick={onClose} />
			<div className="content">
				{children}
			</div>
		</div>
	)
	: null
)

export default Modal
