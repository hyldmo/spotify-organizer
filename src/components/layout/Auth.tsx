import React from 'react'
import { connect } from 'react-redux'
import { replace } from 'redux-first-history'
import { Actions } from '~/actions'
import { loginLink } from '~/consts'
import { State } from '~/types'
import { parseQueryString } from '~/utils/parseQueryString'

const mapStateToProps = (state: State) => ({
	user: state.user
})

const dispatchToProps = {
	tokenAquired: Actions.tokenAquired,
	replace
}

type Props = ReturnType<typeof mapStateToProps> & typeof dispatchToProps

class Login extends React.Component<Props> {
	componentDidMount() {
		if (location.href.indexOf('#access_token=') !== -1) {
			const query = parseQueryString(location.href, true)
			this.props.tokenAquired(query.access_token, query.state)
		}
	}

	componentDidUpdate() {
		if (this.props.user) this.props.replace('/')
	}

	render() {
		return (
			<div className="auth">
				<a className="button primary" href={loginLink()}>
					Log in to Spotify
				</a>
			</div>
		)
	}
}

export default connect(mapStateToProps, dispatchToProps)(Login)
