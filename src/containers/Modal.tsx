import * as React from 'react'
import { connect } from 'react-redux'
import { Actions } from '../actions'
import { State } from '../reducers'
import { } from '../reducers/modals'

type OwnProps = {
	id: string
	disabled?: boolean
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
		const { id, open, disabled, changeModal, children } = this.props
		const Component = React.cloneElement(this.props.component, { onClick: () => !disabled && changeModal(true, id) })
		return (
			<div>
				{Component}
				{open && <div className="modal">
					<div className="overlay" onClick={_ => changeModal(false, id)} />
					<div className="content">
						{children}
					</div>
				</div>}
			</div>
		)
	}
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Modal)
