import * as React from 'react'
import { Link } from 'react-router-dom'
import { Scopes } from '../types'
import { urlEscape } from '../utils'

import { REDIRECT_URI } from '../constants'
import { User } from '../reducers/user'
import '../styles/navbar.pcss'

type Props = {
	user: User
}

const Navbar: React.StatelessComponent<Props> = ({ user }) => {
	const id = '4a3ae815c2a0443c824541a7aa94cfcc'
	const scopes = [Scopes.PLAYLIST_READ_PRIVATE, Scopes.PLAYLIST_MODIFY_PRIVATE]
	const loginLink = urlEscape`https://accounts.spotify.com/authorize?client_id=${id}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes.join(' ')}&show_dialog=true`
	return (
		<header>
			<nav>
				<ul>
					<li><Link to="/">Home</Link></li>
					{!user && <li><a href={loginLink} target="blank">Login</a></li>}
				</ul>
				{user && (
					<ul>
						<li><img height={20} src={user.image} /> {user.name}</li>
					</ul>
				)}
			</nav>
		</header>
	)
}
export default Navbar
