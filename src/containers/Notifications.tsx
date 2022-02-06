import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Snackbar from 'material-ui/Snackbar'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../types'

const mapStateToProps = (state: State) => ({
	notification: state.notifications
})

type Props = ReturnType<typeof mapStateToProps>

const Notifications: React.FC<Props> = ({ notification }) => (
	<Snackbar
		open={notification !== null}
		message={
			notification ? (
				notification.progress ? (
					<span>
						<FontAwesomeIcon icon="spinner" pulse />
						&nbsp;&nbsp;{notification.message}...
					</span>
				) : (
					notification.message
				)
			) : (
				''
			)
		}
	/>
)

export default connect(mapStateToProps)(Notifications)
