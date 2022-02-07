import classnames from 'classnames'
import React from 'react'
import { createPortal } from 'react-dom'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import Button from '../components/Button'
import { State } from '../types'

type OwnProps = {
	id: string
	disabled?: boolean
	centered?: boolean
	component: React.ReactElement<any>
	onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void
	children?: React.ReactNode
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
	const modal = state.modals.find(m => m.id === ownProps.id)
	return {
		open: modal ? modal.open : false
	}
}

const dispatchToProps = {
	registerModal: Actions.registerModal,
	unregisterModal: Actions.unregisterModal,
	changeModal: Actions.changeModal
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof dispatchToProps

class Modal extends React.Component<Props> {
	componentDidMount() {
		const { registerModal, id } = this.props
		registerModal(id)
	}

	componentWillUnmount() {
		const { unregisterModal, id } = this.props
		unregisterModal(id)
	}

	render() {
		const { id, open, centered, disabled, changeModal, children, onConfirm } = this.props
		const Component = React.cloneElement(this.props.component, {
			onClick: () => !disabled && changeModal(true, id)
		})
		return (
			<>
				{Component}
				{open &&
					createPortal(
						<div
							className={classnames('modal__overlay', { centered })}
							onClick={_ => changeModal(false, id)}
						>
							<div className="modal" onClick={e => e.stopPropagation()}>
								<div className="content">{children}</div>
								{onConfirm && (
									<div className="modal__buttons">
										<Button onClick={_ => changeModal(false, id)}>Cancel</Button>
										<Button
											primary
											onClick={e => {
												onConfirm(e)
												changeModal(false, id)
											}}
										>
											Confirm
										</Button>
									</div>
								)}
							</div>
						</div>,
						document.getElementById('root') as HTMLElement
					)}
			</>
		)
	}
}

export default connect(mapStateToProps, dispatchToProps)(Modal)
