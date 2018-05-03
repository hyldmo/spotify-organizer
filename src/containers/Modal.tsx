import * as classnames from 'classnames'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import { State } from '../reducers'

type OwnProps = {
	id: string
	disabled?: boolean
	centered?: boolean
	component: any
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
	componentDidMount () {
		const { registerModal, id } = this.props
		registerModal(id)
	}

	componentWillUnmount () {
		const { unregisterModal, id } = this.props
		unregisterModal(id)
	}

	render () {
		const { id, open, centered, disabled, changeModal, children } = this.props
		const Component = React.cloneElement(this.props.component, { onClick: () => !disabled && changeModal(true, id) })
		return (
			<div>
				{Component}
				{open && createPortal(
					<div className={classnames('modal', { centered })} onClick={_ => changeModal(false, id)} >
						<div className="content" onClick={e => e.stopPropagation()}>
							{children}
						</div>
					</div>,
					document.getElementById('root') as HTMLElement
				)}
			</div>
		)
	}
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Modal)
