import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'

import { Actions } from '../actions'
import { State } from '../reducers'
import { } from '../reducers/modals'

type OwnProps = {
	id: string
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

const stateProps = returntypeof(mapStateToProps)

type Props = OwnProps & typeof stateProps & typeof dispatchToProps

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
		const { id, open, changeModal, children } = this.props
		const Component = React.cloneElement(this.props.component, { onClick: () => changeModal(true, id) })
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
