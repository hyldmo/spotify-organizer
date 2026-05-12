import React from 'react'
import { connect } from 'react-redux'
import { replace } from 'redux-first-history'
import { State } from '~/types'
import { loginLink } from '~/utils/spotifyAuth'

const mapStateToProps = (state: State) => ({
	user: state.user
})

const dispatchToProps = {
	replace
}

type Props = ReturnType<typeof mapStateToProps> & typeof dispatchToProps

class Login extends React.Component<Props> {
	componentDidUpdate () {
		if (this.props.user) this.props.replace('/')
	}

	handleLogin = async (e: React.MouseEvent) => {
		e.preventDefault()
		window.location.href = await loginLink()
	}

	render () {
		return (
			<div className="auth">
				<a className="button primary" href="#" onClick={this.handleLogin}>
					Log in to Spotify
				</a>
			</div>
		)
	}
}

export default connect(mapStateToProps, dispatchToProps)(Login)
